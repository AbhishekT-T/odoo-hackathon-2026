# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import io
import csv

class TripCsvExportController(http.Controller):

    @http.route('/transitops/export_trips_csv', type='http', auth='user')
    def export_trips_csv(self, trip_ids=None, **kw):
        """ Exports selected trips or all trips as a CSV file. """
        # Parse trip_ids from query parameter (e.g. list of comma-separated ids)
        ids = []
        if trip_ids:
            try:
                ids = [int(x) for x in trip_ids.split(',')]
            except ValueError:
                pass

        # Retrieve trip records
        trips = request.env['transitops.trip'].browse(ids) if ids else request.env['transitops.trip'].search([])

        # Create memory buffer for CSV
        output = io.StringIO()
        writer = csv.writer(output, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        # Write CSV Header
        writer.writerow([
            'Trip Reference', 'Source', 'Destination', 'Vehicle Registration', 'Driver Name', 
            'Cargo Weight (kg)', 'Planned Distance (km)', 'Revenue', 'End Odometer (km)', 'Fuel Consumed (L)', 'Status'
        ])

        # Write Data rows
        for trip in trips:
            writer.writerow([
                trip.name,
                trip.source,
                trip.destination,
                trip.vehicle_id.registration_number or '',
                trip.driver_id.name or '',
                trip.cargo_weight,
                trip.planned_distance,
                trip.revenue,
                trip.end_odometer,
                trip.fuel_consumed,
                trip.status
            ])

        # Prepare HTTP Response
        csv_data = output.getvalue()
        output.close()

        filename = "trips_export.csv"
        return request.make_response(
            csv_data,
            headers=[
                ('Content-Type', 'text/csv'),
                ('Content-Disposition', f'attachment; filename={filename};')
            ]
        )
