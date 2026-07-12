# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

class FuelExpense(models.Model):
    _name = 'transitops.fuel.expense'
    _description = 'Fuel Expense Log'
    _order = 'date desc'

    vehicle_id = fields.Many2one('transitops.vehicle', string='Vehicle', required=True)
    liters = fields.Float(string='Liters', required=True)
    cost = fields.Float(string='Cost', required=True)
    date = fields.Date(string='Date', default=fields.Date.context_today, required=True)
    expense_type = fields.Selection([
        ('diesel', 'Diesel'),
        ('petrol', 'Petrol'),
        ('electric', 'Electric Charge'),
        ('other', 'Other'),
    ], string='Expense Type', default='diesel', required=True)

    # Validation constraints
    @api.constrains('liters', 'cost')
    def _check_positive_values(self):
        for record in self:
            if record.liters <= 0:
                raise ValidationError("Liters must be greater than zero.")
            if record.cost <= 0:
                raise ValidationError("Cost must be greater than zero.")
