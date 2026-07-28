import { Bell, Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/mock/data";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-surface px-6">
      <div className="flex items-center lg:hidden">
        <Button variant="ghost" size="icon" className="-ml-2 mr-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open sidebar</span>
        </Button>
        <h1 className="text-xl font-bold text-primary">PulseCareAI</h1>
      </div>
      
      <div className="flex flex-1 items-center justify-end space-x-4">
        <Button variant="ghost" size="icon" className="relative text-on-surface">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
          <span className="sr-only">View notifications</span>
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-medium text-on-surface">{mockUser.name}</p>
            <p className="text-xs text-on-surface-variant">Patient Portal</p>
          </div>
          <Avatar>
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
