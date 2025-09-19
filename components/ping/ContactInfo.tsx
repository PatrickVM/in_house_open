"use client";

interface ContactInfoProps {
  phone?: string | null;
  email: string;
}

export default function ContactInfo({ phone, email }: ContactInfoProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">CONTACT</p>
      <div className="text-sm space-y-1">
        {phone && <p>{phone}</p>}
        <p>{email}</p>
      </div>
    </div>
  );
}