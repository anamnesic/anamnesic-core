export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { getDb } from '@/app/api/_lib/db';
import { ok, err } from '@/app/api/_lib/response';

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ scheduleId: string }> },
) {
    try {
        const { scheduleId } = await params;

        const { SecurityScheduleService } = await import('@/src/core/services/SecurityScheduleService');
        const service = new SecurityScheduleService(await getDb());

        await service.deleteSchedule(scheduleId);

        return ok({ id: scheduleId, deleted: true });
    } catch (e: any) {
        return err('INTERNAL_ERROR', e.message, 500);
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ scheduleId: string }> },
) {
    try {
        const { scheduleId } = await params;
        const body = await req.json();
        const enabled = body?.enabled;

        if (typeof enabled !== 'boolean') {
            return err('VALIDATION_ERROR', 'enabled (boolean) is required', 400);
        }

        const { SecurityScheduleService } = await import('@/src/core/services/SecurityScheduleService');
        const service = new SecurityScheduleService(await getDb());

        await service.toggleSchedule(scheduleId, enabled);

        return ok({ id: scheduleId, enabled });
    } catch (e: any) {
        return err('INTERNAL_ERROR', e.message, 500);
    }
}
