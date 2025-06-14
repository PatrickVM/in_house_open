"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MessageSchedulerProps {
  value?: string; // ISO string or datetime-local format
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  error?: string;
}

export default function MessageScheduler({
  value,
  onChange,
  disabled = false,
  error,
}: MessageSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(!!value);

  // Initialize values when component mounts or value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        // Extract date and time in local timezone
        const localDate = date.toISOString().split("T")[0];
        const localTime = date.toTimeString().slice(0, 5);
        setSelectedDate(localDate);
        setSelectedTime(localTime);
        setIsEnabled(true);
      }
    } else {
      setSelectedDate("");
      setSelectedTime("");
      setIsEnabled(false);
    }
  }, [value]);

  // Calculate minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Calculate minimum time (5 minutes from now if today is selected)
  const getMinTime = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (selectedDate === today) {
      now.setMinutes(now.getMinutes() + 5);
      return now.toTimeString().slice(0, 5);
    }
    return "00:00";
  };

  // Handle date/time changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    updateValue(newDate, selectedTime);
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    updateValue(selectedDate, newTime);
  };

  const updateValue = (date: string, time: string) => {
    if (!isEnabled) {
      onChange(undefined);
      return;
    }

    if (date && time) {
      // Create date in local timezone
      const localDateTime = new Date(`${date}T${time}`);

      // Convert to ISO string (includes timezone)
      const isoString = localDateTime.toISOString();
      onChange(isoString);
    } else {
      onChange(undefined);
    }
  };

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      onChange(undefined);
      setSelectedDate("");
      setSelectedTime("");
    } else {
      // Set default to 1 hour from now
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      const defaultDate = defaultTime.toISOString().split("T")[0];
      const defaultTimeStr = defaultTime.toTimeString().slice(0, 5);

      setSelectedDate(defaultDate);
      setSelectedTime(defaultTimeStr);
      updateValue(defaultDate, defaultTimeStr);
    }
  };

  const handleClear = () => {
    setSelectedDate("");
    setSelectedTime("");
    setIsEnabled(false);
    onChange(undefined);
  };

  const formatPreview = () => {
    if (!selectedDate || !selectedTime) return null;

    const date = new Date(`${selectedDate}T${selectedTime}`);
    if (isNaN(date.getTime())) return null;

    return date.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Publishing Options
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose when to publish your message
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="publishOption"
                checked={!isEnabled}
                onChange={() => handleToggle(false)}
                disabled={disabled}
              />
              <div>
                <div className="font-medium">Publish Immediately</div>
                <div className="text-sm text-muted-foreground">
                  Message will be visible right away
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="publishOption"
                checked={isEnabled}
                onChange={() => handleToggle(true)}
                disabled={disabled}
              />
              <div>
                <div className="font-medium">Schedule for Later</div>
                <div className="text-sm text-muted-foreground">
                  Choose a specific date and time
                </div>
              </div>
            </label>
          </div>

          {isEnabled && (
            <div className="space-y-4 pl-6 border-l-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <Label className="font-medium">Schedule Date & Time</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={disabled}
                  className="ml-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date" className="text-sm">
                    Date
                  </Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={selectedDate}
                    min={getMinDate()}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={disabled}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-time" className="text-sm">
                    Time
                  </Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={selectedTime}
                    min={getMinTime()}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    disabled={disabled}
                    className="text-sm"
                  />
                </div>
              </div>

              {formatPreview() && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Scheduled for:
                    </span>
                    <span className="text-blue-700">{formatPreview()}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
