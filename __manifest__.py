# -*- coding: utf-8 -*-
{
    'name': 'Transit Operations',
    'version': '17.0.1.0.0',
    'summary': 'Transport Operations Platform Module',
    'description': """
        Scaffolded custom Odoo module for managing transport operations:
        - Fleet of vehicles
        - Drivers and license validation placeholders
        - Trip records and routing placeholders
        - Vehicle maintenance tracking
        - Fuel expense logging
    """,
    'category': 'Operations/Transportation',
    'author': 'Deepmind Antigravity',
    'website': 'https://github.com/google-deepmind',
    'depends': ['base'],
    'data': [
        'security/security_groups.xml',
        'security/ir.model.access.csv',
        'views/vehicle_views.xml',
        'views/driver_views.xml',
        'views/trip_views.xml',
        'views/maintenance_views.xml',
        'views/dashboard_views.xml',
        'views/menu.xml',
        'report/trip_report.xml',
    ],
    'demo': [
        'data/demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
