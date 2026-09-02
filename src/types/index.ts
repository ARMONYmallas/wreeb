export const SPACE_TYPES = ['ventanas', 'balcon', 'terraza', 'varios'] as const;
export type SpaceType = (typeof SPACE_TYPES)[number];

export const SERVICE_TYPES = ['instalacion', 'recambio', 'revision', 'no_seguro'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const APPOINTMENT_STATUSES = [
  'new',
  'contacted',
  'confirmed',
  'reschedule',
  'completed',
  'cancelled',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Estados que ocupan un cupo del bloque horario. */
export const ACTIVE_STATUSES: AppointmentStatus[] = ['new', 'contacted', 'confirmed', 'reschedule'];

export const SPACE_LABELS: Record<SpaceType, string> = {
  ventanas: 'Ventanas',
  balcon: 'Balcón',
  terraza: 'Terraza',
  varios: 'Varios espacios',
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  instalacion: 'Instalación nueva',
  recambio: 'Cambiar mallas existentes',
  revision: 'Revisar mis mallas',
  no_seguro: 'No está seguro/a',
};

/** Versión corta para tablas y listados del admin. */
export const SERVICE_LABELS_SHORT: Record<ServiceType, string> = {
  instalacion: 'Instalación',
  recambio: 'Recambio',
  revision: 'Revisión',
  no_seguro: 'Por definir',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  new: 'Nueva',
  contacted: 'Contactado',
  confirmed: 'Confirmada',
  reschedule: 'Reprogramar',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};

export type TimeSlot = {
  id: string;
  label: string | null;
  start_time: string; // 'HH:MM:SS'
  end_time: string;
  default_capacity: number;
  is_active: boolean;
  sort_order: number;
};

export type WeeklyAvailabilityRow = {
  id: string;
  day_of_week: number; // 0 = domingo … 6 = sábado
  time_slot_id: string;
  is_active: boolean;
  capacity_override: number | null;
};

export type AvailabilityOverrideRow = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  time_slot_id: string | null; // null = el día completo
  is_available: boolean;
  capacity_override: number | null;
  reason: string | null;
};

/** Un bloque tal como lo ve el público: sin datos internos. */
export type PublicSlot = {
  slotId: string;
  label: string | null;
  startTime: string; // 'HH:MM'
  endTime: string;
  remaining: number;
};

export type PublicDay = {
  date: string; // 'YYYY-MM-DD'
  slots: PublicSlot[];
};

export type Appointment = {
  id: string;
  request_number: string;
  name: string;
  phone: string;
  email: string | null;
  region_code: string;
  region_name: string;
  commune: string;
  space_type: SpaceType;
  service_type: ServiceType;
  preferred_date: string;
  time_slot_id: string | null;
  status: AppointmentStatus;
  address: string | null;
  apartment: string | null;
  floor: string | null;
  reference: string | null;
  window_count: number | null;
  details: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentWithSlot = Appointment & {
  time_slot: Pick<TimeSlot, 'id' | 'label' | 'start_time' | 'end_time'> | null;
  photo_count?: number;
};

export type AdminNote = {
  id: string;
  appointment_id: string;
  author_email: string | null;
  content: string;
  created_at: string;
};

export type AppointmentEvent = {
  id: string;
  appointment_id: string;
  author_email: string | null;
  type: string;
  from_status: AppointmentStatus | null;
  to_status: AppointmentStatus | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

/** Estado de disponibilidad de un día en el calendario administrativo. */
export type DayAvailabilityState = 'available' | 'partial' | 'blocked' | 'no_schedule';
