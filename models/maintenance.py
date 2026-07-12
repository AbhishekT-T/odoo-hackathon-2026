# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Maintenance(models.Model):
    _name = 'transitops.maintenance'
    _description = 'Vehicle Maintenance'

    name = fields.Char(string='Maintenance Reference', required=True, copy=False, readonly=True, default='New')
    vehicle_id = fields.Many2one('transitops.vehicle', string='Vehicle', required=True)
    description = fields.Text(string='Description')
    cost = fields.Float(string='Maintenance Cost', default=0.0)
    status = fields.Selection([
        ('active', 'Active'),
        ('closed', 'Closed'),
    ], string='Status', default='active', required=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('transitops.maintenance') or 'New'
        records = super(Maintenance, self).create(vals_list)
        for record in records:
            if record.status == 'active':
                record.vehicle_id.action_set_in_shop()
        return records

    def write(self, vals):
        res = super(Maintenance, self).write(vals)
        if 'status' in vals or 'vehicle_id' in vals:
            for record in self:
                if record.status == 'active':
                    record.vehicle_id.action_set_in_shop()
                elif record.status == 'closed':
                    if record.vehicle_id.status == 'in_shop':
                        record.vehicle_id.action_set_available()
        return res

    # State transitions
    def action_close_maintenance(self):
        self.write({'status': 'closed'})
