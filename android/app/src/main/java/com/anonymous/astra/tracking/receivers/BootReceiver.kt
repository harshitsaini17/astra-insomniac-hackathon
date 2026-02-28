package com.anonymous.astra.tracking.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.anonymous.astra.tracking.TrackingPreferences
import com.anonymous.astra.tracking.services.AppTrackingService
import com.anonymous.astra.tracking.services.FocusStateWorker

class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AstraBootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
            intent.action != Intent.ACTION_MY_PACKAGE_REPLACED) {
            return
        }

        if (!TrackingPreferences.isTrackingEnabled(context)) {
            Log.d(TAG, "Tracking is disabled, skipping boot restore")
            return
        }

        FocusStateWorker.schedule(context)
        AppTrackingService.start(context)
        Log.d(TAG, "Tracking service restored after boot/update")
    }
}
