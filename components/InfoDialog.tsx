import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface InfoDialogProps {
  info: string;
  children: React.ReactNode;
}

export function InfoDialog({ info, children }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Additional Information</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{info}</p>
      </DialogContent>
    </Dialog>
  );
}
