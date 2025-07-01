
import React, { useEffect, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Music, User, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpotifyStore } from '@/store/spotifyStore';

interface PlaylistSearchProps {
  onSelect: (playlistId: string) => void;
  selectedPlaylist: string;
}

const PlaylistSearch = ({ onSelect, selectedPlaylist }: PlaylistSearchProps) => {
  const [open, setOpen] = useState(false);
  const {
    userPlaylists,
    isLoadingPlaylists,
    playlistSearchQuery,
    searchResults,
    fetchUserPlaylists,
    searchPlaylists,
    setPlaylistSearchQuery,
    getAllPlaylists,
    getAvailablePlaylists,
    isReady
  } = useSpotifyStore();

  // Fetch user playlists when component mounts and player is ready
  useEffect(() => {
    if (isReady && userPlaylists.length === 0 && !isLoadingPlaylists) {
      fetchUserPlaylists();
    }
  }, [isReady, userPlaylists.length, isLoadingPlaylists, fetchUserPlaylists]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaylists(playlistSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [playlistSearchQuery, searchPlaylists]);

  const publicPlaylists = getAvailablePlaylists();
  const allPlaylists = getAllPlaylists();

  // Get display name for selected playlist
  const getSelectedPlaylistName = () => {
    if (publicPlaylists[selectedPlaylist as keyof typeof publicPlaylists]) {
      return publicPlaylists[selectedPlaylist as keyof typeof publicPlaylists].name;
    }
    
    const userPlaylist = userPlaylists.find(p => p.id === selectedPlaylist);
    if (userPlaylist) {
      return userPlaylist.name;
    }
    
    return 'Select playlist...';
  };

  // Get playlists to display based on search
  const playlistsToShow = () => {
    if (playlistSearchQuery.trim()) {
      return searchResults;
    }
    return allPlaylists;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 shrink-0" />
            <span className="truncate">{getSelectedPlaylistName()}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search playlists..." 
            value={playlistSearchQuery}
            onValueChange={setPlaylistSearchQuery}
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>
              {isLoadingPlaylists ? 'Loading playlists...' : 'No playlists found.'}
            </CommandEmpty>
            
            {/* Public Playlists */}
            {Object.entries(publicPlaylists).some(([key]) => 
              !playlistSearchQuery.trim() || 
              publicPlaylists[key as keyof typeof publicPlaylists].name.toLowerCase().includes(playlistSearchQuery.toLowerCase())
            ) && (
              <CommandGroup heading="Focus Playlists">
                {Object.entries(publicPlaylists)
                  .filter(([key, playlist]) => 
                    !playlistSearchQuery.trim() || 
                    playlist.name.toLowerCase().includes(playlistSearchQuery.toLowerCase())
                  )
                  .map(([key, playlist]) => (
                    <CommandItem
                      key={key}
                      value={key}
                      onSelect={() => {
                        onSelect(key);
                        setOpen(false);
                        setPlaylistSearchQuery('');
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{playlist.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {playlist.description}
                          </div>
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          selectedPlaylist === key ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {/* User Playlists */}
            {(playlistsToShow().filter(p => !p.isPublic).length > 0) && (
              <CommandGroup heading="Your Playlists">
                {playlistsToShow()
                  .filter(playlist => !playlist.isPublic)
                  .map((playlist) => (
                    <CommandItem
                      key={playlist.id}
                      value={playlist.id}
                      onSelect={() => {
                        onSelect(playlist.id);
                        setOpen(false);
                        setPlaylistSearchQuery('');
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{playlist.name}</div>
                          {playlist.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {playlist.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          selectedPlaylist === playlist.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PlaylistSearch;
