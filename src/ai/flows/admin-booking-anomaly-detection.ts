'use server';
/**
 * @fileOverview This file implements a Genkit flow for detecting unusual vehicle booking patterns.
 *
 * - adminBookingAnomalyDetection - A function that triggers the anomaly detection process.
 * - AdminBookingAnomalyDetectionInput - The input type for the adminBookingAnomalyDetection function.
 * - AdminBookingAnomalyDetectionOutput - The return type for the adminBookingAnomalyDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BookingDataSchema = z.object({
  bookingId: z.string().describe('Unique identifier for the booking.'),
  vehicleId: z.string().describe('Identifier for the vehicle.'),
  vehicleName: z.string().describe('Name of the vehicle.'),
  employeeName: z.string().describe('Name of the employee who made the booking.'),
  department: z.string().describe('Department of the employee.'),
  startDateTime:
    z.string().datetime().describe('Start date and time of the booking (ISO 8601 format).'),
  endDateTime:
    z.string().datetime().describe('End date and time of the booking (ISO 8601 format).'),
  purpose: z.string().describe('Purpose of the booking.'),
  status:
    z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'])
      .describe('Current status of the booking.'),
  createdAt: z
    .string()
    .datetime()
    .describe('Timestamp when the booking was created (ISO 8601 format).'),
});

const AdminBookingAnomalyDetectionInputSchema = z.object({
  bookings:
    z.array(BookingDataSchema).describe('A list of recent or relevant vehicle bookings to analyze.'),
});
export type AdminBookingAnomalyDetectionInput = z.infer<
  typeof AdminBookingAnomalyDetectionInputSchema
>;

const AdminBookingAnomalyDetectionOutputSchema = z.object({
  isAnomaly: z.boolean().describe('True if an anomaly is detected, false otherwise.'),
  anomalyType:
    z.string()
      .optional()
      .describe(
        'Categorization of the anomaly (e.g., "LongDuration", "FrequentBookings", "ConcurrentBookings").'
      ),
  description:
    z.string().describe('A detailed explanation of the detected anomaly or a positive message if no anomaly is found.'),
  suggestedAction:
    z.string()
      .optional()
      .describe('A suggested action for the administrator if an anomaly is detected.'),
  relevantBookingIds:
    z.array(z.string())
      .optional()
      .describe('A list of Booking IDs associated with the detected anomaly.'),
});
export type AdminBookingAnomalyDetectionOutput = z.infer<
  typeof AdminBookingAnomalyDetectionOutputSchema
>;

export async function adminBookingAnomalyDetection(
  input: AdminBookingAnomalyDetectionInput
): Promise<AdminBookingAnomalyDetectionOutput> {
  return adminBookingAnomalyDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminBookingAnomalyDetectionPrompt',
  input: {schema: AdminBookingAnomalyDetectionInputSchema},
  output: {schema: AdminBookingAnomalyDetectionOutputSchema},
  prompt: `You are an intelligent anomaly detection system for a company vehicle booking system. Your task is to analyze vehicle booking patterns and identify any unusual or suspicious activities.\n\nConsider the following criteria for anomalies:\n1.  **Excessively long booking durations:** A single booking that spans many days or weeks (e.g., more than 3-5 days) without a clear justifiable purpose.\n2.  **Frequent bookings by a single employee:** An employee booking vehicles significantly more often than others within a given timeframe (e.g., multiple bookings per week consistently), which might indicate misuse or a specific operational need that should be addressed differently. Look for outliers in booking frequency per employee.\n3.  **Suspicious concurrent bookings:** An employee booking multiple different vehicles for overlapping times without a clear justification, or a single vehicle being booked by different employees for highly overlapping times (which the system should prevent, but could indicate data issues).\n\nAnalyze the provided list of recent vehicle bookings. Focus on 'Approved' or 'Pending' bookings for active analysis.\n\nBooking Data:\n{{#each bookings}}\n  - Booking ID: {{{bookingId}}}\n    Vehicle ID: {{{vehicleId}}} ({{{vehicleName}}})\n    Employee Name: {{{employeeName}}} (Department: {{{department}}})\n    Start: {{{startDateTime}}}\n    End: {{{endDateTime}}}\n    Purpose: {{{purpose}}}\n    Status: {{{status}}}\n    Created At: {{{createdAt}}}\n{{/each}}\n\nBased on the criteria and the booking data, determine if there is an anomaly.\nIf an anomaly is detected, set 'isAnomaly' to true, categorize it using 'anomalyType', provide a detailed 'description', suggest a specific 'suggestedAction' for an administrator, and list the 'relevantBookingIds' associated with the anomaly.\nIf no clear anomaly is detected, set 'isAnomaly' to false, provide a brief positive 'description' (e.g., "No significant anomalies detected in recent bookings."), and leave 'anomalyType', 'suggestedAction', and 'relevantBookingIds' as null or undefined.\n`,
});

const adminBookingAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'adminBookingAnomalyDetectionFlow',
    inputSchema: AdminBookingAnomalyDetectionInputSchema,
    outputSchema: AdminBookingAnomalyDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
