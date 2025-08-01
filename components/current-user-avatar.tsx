'use client'

import { useCurrentUserImage } from '@/hooks/use-current-user-image'
import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CurrentUserMenu } from '@/components/current-user-menu'

export const CurrentUserAvatar = () => {
  const profileImage = useCurrentUserImage()
  const name = useCurrentUserName()
  
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase()

  return (
    <CurrentUserMenu>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          {profileImage && <AvatarImage src={profileImage} alt={initials} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Button>
    </CurrentUserMenu>
  )
}
