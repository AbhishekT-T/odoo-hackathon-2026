# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

class Vehicle(models.Model):
    _name = 'transitops.vehicle'
    _description = 'Vehicle'
    _rec_name = 'registration_number'

    registration_number = fields.Char(string='Registration Number', required=True, copy=False)
    name = fields.Char(string='Vehicle Name/Model', required=True)
    type = fields.Char(string='Vehicle Type', help='e.g. Truck, Van, Car')
    max_load_capacity = fields.Float(string='Max Load Capacity (kg)', required=True)
    odometer = fields.Float(string='Odometer (km)', default=0.0)
    acquisition_cost = fields.Float(string='Acquisition Cost', default=0.0)
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('in_shop', 'In Shop'),
        ('retired', 'Retired'),
    ], string='Status', default='available', required=True)

    # Relationships
    fuel_expense_ids = fields.One2many('transitops.fuel.expense', 'vehicle_id', string='Fuel & Expense Logs')
    maintenance_ids = fields.One2many('transitops.maintenance', 'vehicle_id', string='Maintenance Logs')
    trip_ids = fields.One2many('transitops.trip', 'vehicle_id', string='Trips')

    # Computed fields for analytics
    total_fuel_cost = fields.Float(compute='_compute_fuel_cost', string='Total Fuel Cost')
    total_maintenance_cost = fields.Float(compute='_compute_maintenance_cost', string='Total Maintenance Cost')
    total_operational_cost = fields.Float(compute='_compute_operational_cost', string='Total Operational Cost')
    total_trip_revenue = fields.Float(compute='_compute_trip_revenue', string='Total Trip Revenue')
    fuel_efficiency = fields.Float(compute='_compute_fuel_efficiency', string='Fuel Efficiency (km/L)')
    roi = fields.Float(compute='_compute_roi', string='Vehicle ROI')

    _sql_constraints = [
        ('registration_number_unique', 'unique(registration_number)', 'The registration number must be unique!'),
    ]

    @api.depends('fuel_expense_ids.cost')
    def _compute_fuel_cost(self):
        for record in self:
            record.total_fuel_cost = sum(record.fuel_expense_ids.mapped('cost'))

    @api.depends('maintenance_ids.cost')
    def _compute_maintenance_cost(self):
        for record in self:
            # We filter for maintenance logs. In standard cases, all logged costs sum up
            record.total_maintenance_cost = sum(record.maintenance_ids.mapped('cost'))

    @api.depends('total_fuel_cost', 'total_maintenance_cost')
    def _compute_operational_cost(self):
        for record in self:
            record.total_operational_cost = record.total_fuel_cost + record.total_maintenance_cost

    @api.depends('trip_ids.revenue', 'trip_ids.status')
    def _compute_trip_revenue(self):
        for record in self:
            completed_trips = record.trip_ids.filtered(lambda t: t.status == 'completed')
            record.total_trip_revenue = sum(completed_trips.mapped('revenue'))

    @api.depends('trip_ids.planned_distance', 'trip_ids.status', 'fuel_expense_ids.liters')
    def _compute_fuel_efficiency(self):
        for record in self:
            completed_trips = record.trip_ids.filtered(lambda t: t.status == 'completed')
            total_distance = sum(completed_trips.mapped('planned_distance'))
            total_liters = sum(record.fuel_expense_ids.mapped('liters'))
            record.fuel_efficiency = total_distance / total_liters if total_liters > 0 else 0.0

    @api.depends('total_trip_revenue', 'total_operational_cost', 'acquisition_cost')
    def _compute_roi(self):
        for record in self:
            if record.acquisition_cost > 0:
                record.roi = (record.total_trip_revenue - record.total_operational_cost) / record.acquisition_cost
            else:
                record.roi = 0.0

    # State transitions
    def action_set_available(self):
        self.write({'status': 'available'})

    def action_set_on_trip(self):
        self.write({'status': 'on_trip'})

    def action_set_in_shop(self):
        self.write({'status': 'in_shop'})

    def action_set_retired(self):
        self.write({'status': 'retired'})

    # Validation constraints
    @api.constrains('max_load_capacity')
    def _check_max_load_capacity(self):
        for record in self:
            if record.max_load_capacity <= 0:
                raise ValidationError("Maximum load capacity must be greater than zero.")

    @api.constrains('odometer')
    def _check_odometer(self):
        for record in self:
            if record.odometer < 0:
                raise ValidationError("Odometer value cannot be negative.")
