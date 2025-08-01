import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';

interface UserInfoProps {
    user: User;
    showEmail?: boolean;
}

export const UserInfo = memo(function UserInfo({ user, showEmail = false }: UserInfoProps) {
    const getInitials = useInitials();
    const [cacheTimestamp, setCacheTimestamp] = useState(() => 
        user.updated_at ? new Date(user.updated_at).getTime() : Date.now()
    );

    // Memoizar as iniciais para evitar recálculos desnecessários
    const initials = useMemo(() => getInitials(user.name), [getInitials, user.name]);

    // Escutar evento de atualização de foto de perfil
    useEffect(() => {
        const handleProfilePhotoUpdate = (event: CustomEvent) => {
            if (event.detail.userId === user.id) {
                setCacheTimestamp(event.detail.timestamp);
            }
        };

        window.addEventListener('profile-photo-updated', handleProfilePhotoUpdate as EventListener);
        
        return () => {
            window.removeEventListener('profile-photo-updated', handleProfilePhotoUpdate as EventListener);
        };
    }, [user.id]);

    // Memoizar a URL da foto para evitar recálculos desnecessários
    const profilePhotoUrl = useMemo(() => {
        if (user.profile_photo) {
            return `/storage/${user.profile_photo}?v=${cacheTimestamp}`;
        }
        return user.avatar;
    }, [user.profile_photo, user.avatar, cacheTimestamp]);

    return (
        <div className="sidebar-user-info flex items-center gap-2 w-full min-w-0">
            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                {profilePhotoUrl ? (
                    <img 
                        src={profilePhotoUrl} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                        {initials}
                    </span>
                )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
        </div>
    );
});