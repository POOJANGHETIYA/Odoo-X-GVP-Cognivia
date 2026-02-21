import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useAddVehicle } from '../hooks/useVehicles';

const addVehicleFormSchema = z.object({
    // Required core fields
    license_plate: z.string().min(1, 'License plate is required'),
    category: z.enum(['Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck'], {
        message: 'Category is required',
    }),
    capacity_kg: z.coerce.number({ message: 'Must be a number' }).positive('Must be greater than 0'),
    current_odometer: z.coerce.number({ message: 'Must be a number' }).nonnegative('Must be 0 or greater'),
    status: z.enum(['Available', 'In_Shop', 'Retired'], {
        message: 'Status is required',
    }),
    // Optional extended fields
    registration_certificate: z.string().optional(),
    vin: z.string().max(17, 'VIN max 17 characters').optional(),
    brand: z.string().optional(),
    fuel_type: z.enum(['Petrol', 'Diesel', 'CNG', 'EV']).optional(),
    transmission_type: z.enum(['Manual', 'Automatic']).optional(),
    year: z.coerce.number().int().min(1990).max(2030).optional(),
    gps_tracker: z.string().optional(),
    gps_tracker_id: z.string().optional(),
    vehicle_owner: z.string().optional(),
    engine_number: z.string().optional(),
    chassis_number: z.string().optional(),
    acquisition_cost: z.coerce.number().positive().optional(),
    comment: z.string().optional(),
});

type FormValues = z.infer<typeof addVehicleFormSchema>;

interface AddVehicleModalProps {
    onClose: () => void;
}

function Field({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {required && <span className="text-red-500 mr-0.5">*</span>}
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#3bb273] focus:ring-2 focus:ring-[#3bb273]/20 transition-colors';
const selectClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#3bb273] focus:ring-2 focus:ring-[#3bb273]/20 transition-colors appearance-none';
const errorClass =
    'border-red-400 focus:border-red-400 focus:ring-red-200 bg-red-50';

export function AddVehicleModal({ onClose }: AddVehicleModalProps) {
    const { mutate: addVehicle, isPending } = useAddVehicle();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        // @ts-expect-error — known Zod v4 + rHF resolver type mismatch with z.coerce.number()
        resolver: zodResolver(addVehicleFormSchema),
    });

    const onSubmit = (data: FormValues) => {
        setSubmitError(null);
        const acquisition_cost = data.acquisition_cost ?? 1;

        addVehicle(
            {
                license_plate: data.license_plate,
                category: data.category,
                capacity_kg: data.capacity_kg,
                current_odometer: data.current_odometer,
                status: data.status,
                acquisition_cost,
                brand: data.brand,
                year: data.year,
                fuel_type: data.fuel_type,
                transmission_type: data.transmission_type,
                registration_certificate: data.registration_certificate,
                vin: data.vin,
                gps_tracker: data.gps_tracker,
                gps_tracker_id: data.gps_tracker_id,
                vehicle_owner: data.vehicle_owner,
                engine_number: data.engine_number,
                chassis_number: data.chassis_number,
                comment: data.comment,
                fleet: 'FleetFlow DEMO #1',
                gps_status: 'No_GPS',
                has_photo: false,
                has_documents: false,
            },
            {
                onSuccess: () => onClose(),
                onError: () => setSubmitError('Failed to add vehicle. Please try again.'),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Add Vehicle</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    {submitError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {submitError}
                        </div>
                    )}

                    {/* Required fields */}
                    <Field label="License Plate Number" required error={errors.license_plate?.message}>
                        <input
                            {...register('license_plate')}
                            placeholder="e.g. MH-12-AB-1234"
                            className={`${inputClass} ${errors.license_plate ? errorClass : ''}`}
                        />
                    </Field>

                    <Field label="Vehicle Registration Certificate (Series and Number)" error={errors.registration_certificate?.message}>
                        <input
                            {...register('registration_certificate')}
                            placeholder="Enter series and number"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Vehicle Identification Number (VIN)" error={errors.vin?.message}>
                        <input
                            {...register('vin')}
                            placeholder="Enter 17-character VIN"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Brand and Model" error={errors.brand?.message}>
                        <select {...register('brand')} className={selectClass}>
                            <option value="">Select brand and model</option>
                            <option>Tata Motors</option>
                            <option>Ashok Leyland</option>
                            <option>Mahindra</option>
                            <option>Eicher</option>
                            <option>Hero</option>
                            <option>VECV</option>
                            <option>Other</option>
                        </select>
                    </Field>

                    <Field label="Fuel Type" error={errors.fuel_type?.message}>
                        <select {...register('fuel_type')} className={selectClass}>
                            <option value="">Select fuel type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="CNG">CNG</option>
                            <option value="EV">Electric (EV)</option>
                        </select>
                    </Field>

                    <Field label="Transmission Type" error={errors.transmission_type?.message}>
                        <select {...register('transmission_type')} className={selectClass}>
                            <option value="">Select transmission type</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                        </select>
                    </Field>

                    <Field label="Year" error={errors.year?.message}>
                        <input
                            {...register('year')}
                            type="number"
                            placeholder="e.g. 2024"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Category" required error={errors.category?.message}>
                        <select
                            {...register('category')}
                            className={`${selectClass} ${errors.category ? errorClass : ''}`}
                        >
                            <option value="">Select category</option>
                            <option value="Bike">Bike</option>
                            <option value="3_Wheeler">3 Wheeler</option>
                            <option value="Mini_Truck">Mini Truck</option>
                            <option value="Medium_Truck">Medium Truck</option>
                            <option value="Heavy_Truck">Heavy Truck</option>
                        </select>
                    </Field>

                    <Field label="Max Load Capacity (kg)" required error={errors.capacity_kg?.message}>
                        <input
                            {...register('capacity_kg')}
                            type="number"
                            placeholder="e.g. 2000"
                            className={`${inputClass} ${errors.capacity_kg ? errorClass : ''}`}
                        />
                    </Field>

                    <Field label="Current Odometer (km)" required error={errors.current_odometer?.message}>
                        <input
                            {...register('current_odometer')}
                            type="number"
                            placeholder="e.g. 15400"
                            className={`${inputClass} ${errors.current_odometer ? errorClass : ''}`}
                        />
                    </Field>

                    <Field label="Initial Status" required error={errors.status?.message}>
                        <select
                            {...register('status')}
                            className={`${selectClass} ${errors.status ? errorClass : ''}`}
                        >
                            <option value="">Select status</option>
                            <option value="Available">Available</option>
                            <option value="In_Shop">In Shop</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </Field>

                    <Field label="GPS Tracker" error={errors.gps_tracker?.message}>
                        <select {...register('gps_tracker')} className={selectClass}>
                            <option value="">Select a tracker</option>
                            <option value="Traccar">Traccar</option>
                            <option value="Teltonika">Teltonika</option>
                            <option value="Other">Other</option>
                        </select>
                    </Field>

                    <Field label="GPS Tracker ID" error={errors.gps_tracker_id?.message}>
                        <input
                            {...register('gps_tracker_id')}
                            placeholder="Enter tracker ID"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Vehicle Owner" error={errors.vehicle_owner?.message}>
                        <input
                            {...register('vehicle_owner')}
                            placeholder="Enter the owner's name"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Engine Number" error={errors.engine_number?.message}>
                        <input
                            {...register('engine_number')}
                            placeholder="Engine Number"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Chassis Number" error={errors.chassis_number?.message}>
                        <input
                            {...register('chassis_number')}
                            placeholder="Chassis Number"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Acquisition Cost (₹)" error={errors.acquisition_cost?.message}>
                        <input
                            {...register('acquisition_cost')}
                            type="number"
                            placeholder="e.g. 1200000"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Comment" error={errors.comment?.message}>
                        <textarea
                            {...register('comment')}
                            placeholder="Comment"
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </Field>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100">
                    <button
                        onClick={handleSubmit(onSubmit as any)}
                        disabled={isPending}
                        className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
