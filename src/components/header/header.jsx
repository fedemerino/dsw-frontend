'use client';

import { Button } from '@/components/ui/button';
import { Building2, Menu, User, LogOut, Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/auth/authContext';

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-10">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">ReservAR</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/search"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Alojamientos
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
            <a href="/publish">Publica tu propiedad</a>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="cursor-pointer">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/profile">Mi perfil</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/profile/bookings">Mis reservas</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/profile/listings">Mis publicaciones</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    Mis favoritos
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="icon" asChild>
              <a href="/login">
                <User className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
