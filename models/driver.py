# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

class Driver(models.Model):
    _name = 'transitops.driver'
    _description = 'Driver'

    name = fields.Char(string='Name', required=True)
    license_number = fields.Char(string='License Number', required=True)
    license_category = fields.Char(string='License Category', help='e.g. Class A, Class B')
    license_expiry_date = fields.Date(string='License Expiry Date')
    contact_number = fields.Char(string='Contact Number')
    safety_score = fields.Float(string='Safety Score', default=100.0)
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('off_duty', 'Off Duty'),
        ('suspended', 'Suspended'),
    ], string='Status', default='available', required=True)

    _sql_constraints = [
        ('license_number_unique', 'unique(license_number)', 'The license number must be unique!'),
    ]

    # State transitions
    def action_set_available(self):
        self.write({'status': 'available'})

    def action_set_on_trip(self):
        self.write({'status': 'on_trip'})

    def action_set_off_duty(self):
        self.write({'status': 'off_duty'})

    def action_set_suspended(self):
        self.write({'status': 'suspended'})

    # Validation constraints
    @api.constrains('safety_score')
    def _check_safety_score(self):
        for record in self:
            if record.safety_score < 0 or record.safety_score > 100:
                raise ValidationError("Safety score must be between 0 and 100.")
