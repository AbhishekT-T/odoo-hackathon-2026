# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

class Trip(models.Model):
    _name = 'transitops.trip'
    _description = 'Trip'

    name = fields.Char(string='Trip Reference', required=True, copy=False, readonly=True, default='New')
    source = fields.Char(string='Source', required=True)
    destination = fields.Char(string='Destination', required=True)
    vehicle_id = fields.Many2one('transitops.vehicle', string='Vehicle', required=True)
    driver_id = fields.Many2one('transitops.driver', string='Driver', required=True)
    cargo_weight = fields.Float(string='Cargo Weight (kg)', required=True)
    planned_distance = fields.Float(string='Planned Distance (km)', required=True)
    revenue = fields.Float(string='Trip Revenue', default=0.0)
    end_odometer = fields.Float(string='End Odometer (km)', default=0.0)
    fuel_consumed = fields.Float(string='Fuel Consumed (L)', default=0.0)
    status = fields.Selection([
        ('draft', 'Draft'),
        ('dispatched', 'Dispatched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('transitops.trip') or 'New'
        return super(Trip, self).create(vals_list)

    # Validation constraints
    @api.constrains('cargo_weight', 'vehicle_id')
    def _check_cargo_weight(self):
        for record in self:
            if record.vehicle_id and record.cargo_weight > record.vehicle_id.max_load_capacity:
                raise ValidationError(f"Cargo weight ({record.cargo_weight} kg) exceeds the vehicle max load capacity ({record.vehicle_id.max_load_capacity} kg)!")

    @api.constrains('vehicle_id', 'driver_id', 'status')
    def _check_assignments(self):
        for record in self:
            if record.status == 'dispatched':
                # Check if vehicle is already in another dispatched trip
                other_vehicle_trips = self.search([
                    ('vehicle_id', '=', record.vehicle_id.id),
                    ('status', '=', 'dispatched'),
                    ('id', '!=', record.id)
                ])
                if other_vehicle_trips:
                    raise ValidationError(f"Vehicle {record.vehicle_id.registration_number} is already assigned to an active trip!")
                
                # Check if driver is already in another dispatched trip
                other_driver_trips = self.search([
                    ('driver_id', '=', record.driver_id.id),
                    ('status', '=', 'dispatched'),
                    ('id', '!=', record.id)
                ])
                if other_driver_trips:
                    raise ValidationError(f"Driver {record.driver_id.name} is already assigned to an active (dispatched) trip!")

    # State transitions
    def action_dispatch(self):
        self.ensure_one()
        # Validation checks
        if self.vehicle_id.status != 'available':
            raise ValidationError(f"Vehicle {self.vehicle_id.registration_number} is currently {self.vehicle_id.status} and cannot be dispatched!")
        if self.driver_id.status != 'available':
            raise ValidationError(f"Driver {self.driver_id.name} is currently {self.driver_id.status} and cannot be dispatched!")
        if self.driver_id.license_expiry_date and self.driver_id.license_expiry_date < fields.Date.today():
            raise ValidationError(f"Driver {self.driver_id.name}'s license is expired ({self.driver_id.license_expiry_date}) and cannot be dispatched!")

        self.write({'status': 'dispatched'})
        self.vehicle_id.action_set_on_trip()
        self.driver_id.action_set_on_trip()

    def action_complete(self):
        self.ensure_one()
        if self.status != 'dispatched':
            raise ValidationError("Only dispatched trips can be marked as completed.")
        if self.end_odometer <= self.vehicle_id.odometer:
            raise ValidationError(f"End Odometer ({self.end_odometer}) must be greater than current vehicle Odometer ({self.vehicle_id.odometer})!")
        if self.fuel_consumed <= 0:
            raise ValidationError("Fuel consumed must be greater than 0.")

        self.write({'status': 'completed'})
        # Update vehicle odometer
        self.vehicle_id.write({'odometer': self.end_odometer})
        # Create a corresponding fuel log automatically for reporting calculations
        self.env['transitops.fuel.expense'].create({
            'vehicle_id': self.vehicle_id.id,
            'liters': self.fuel_consumed,
            'cost': self.fuel_consumed * 1.5,  # Estimate cost at 1.5 per unit
            'date': fields.Date.today(),
            'expense_type': 'diesel'
        })
        # Restore statuses
        self.vehicle_id.action_set_available()
        self.driver_id.action_set_available()

    def action_cancel(self):
        self.ensure_one()
        old_status = self.status
        self.write({'status': 'cancelled'})
        if old_status == 'dispatched':
            self.vehicle_id.action_set_available()
            self.driver_id.action_set_available()
