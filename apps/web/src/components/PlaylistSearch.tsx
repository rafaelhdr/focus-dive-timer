

import React, { useEffect, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from "@focusdive/ui";
import { Check, ChevronsUpDown, Music, User, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@focusdive/utils';
import { useSpotifyStore } from '@/store/spotifyStore';

interface PlaylistSearchProps {
  onSelect: (playlistId: string) => void;
  selectedPlaylist: string;
  disabled?: boolean;
}

const PlaylistSearch = ({ onSelect, selectedPlaylist, disabled = false }: PlaylistSearchProps) => {
  const [open, setOpen] = useState(false);
  const {
    userPlaylists,
    isLoadingPlaylists,
    playlistSearchQuery,
    searchResults,
    isSearching,
    error,
    fetchUserPlaylists,
    searchPlaylists,
    setPlaylistSearchQuery,
    clearError,
    isReady,
    focusPlaylist,
    breakPlaylist
  } = useSpotifyStore();

  // Fetch user playlists when component mounts and player is ready
  useEffect(() => {
    if (isReady && userPlaylists.length === 0 && !isLoadingPlaylists) {
      console.log('Fetching user playlists for search...');
      fetchUserPlaylists();
    }
  }, [isReady, userPlaylists.length, isLoadingPlaylists, fetchUserPlaylists]);

  // Handle search with debouncing
  useEffect(() => {
    if (!playlistSearchQuery.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      console.log('Debounced search triggered for:', playlistSearchQuery);
      searchPlaylists(playlistSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [playlistSearchQuery, searchPlaylists]);

  // Get display name for selected playlist
  const getSelectedPlaylistName = () => {
    // First check user playlists
    const userPlaylist = userPlaylists.find(p => p.id === selectedPlaylist);
    if (userPlaylist) {
      return userPlaylist.name;
    }
    
    // Then check search results
    const searchPlaylist = searchResults.find(p => p.id === selectedPlaylist);
    if (searchPlaylist) {
      return searchPlaylist.name;
    }
    
    // Check if this matches the focus playlist from settings
    if (focusPlaylist && focusPlaylist.id === selectedPlaylist) {
      return focusPlaylist.name;
    }
    
    // Check if this matches the break playlist from settings
    if (breakPlaylist && breakPlaylist.id === selectedPlaylist) {
      return breakPlaylist.name;
    }
    
    return 'Select playlist...';
  };

  // Get playlists to display based on search
  const playlistsToShow = () => {
    if (playlistSearchQuery.trim()) {
      console.log('🔍 Search query:', playlistSearchQuery);
      console.log('🔍 Search results:', searchResults);
      console.log('🔍 Search results length:', searchResults.length);
      console.log('🔍 User playlists length:', userPlaylists.length);
      return searchResults;
    }
    console.log('📝 Showing all user playlists:', userPlaylists.length);
    return userPlaylists;
  };

  const handlePlaylistSelect = (playlistId: string) => {
    console.log('Playlist selected:', playlistId);
    onSelect(playlistId);
    setOpen(false);
    setPlaylistSearchQuery('');
    if (error) {
      clearError();
    }
  };

  const currentPlaylists = playlistsToShow();
  const hasSearchQuery = playlistSearchQuery.trim().length > 0;
  const isEmptyState = !isLoadingPlaylists && !isSearching && currentPlaylists.length === 0;

  console.log('🎵 Render state:', {
    hasSearchQuery,
    isEmptyState,
    currentPlaylistsLength: currentPlaylists.length,
    isLoadingPlaylists,
    isSearching,
    error
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 shrink-0" />
            <span className="truncate">{getSelectedPlaylistName()}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search playlists..." 
            value={playlistSearchQuery}
            onValueChange={setPlaylistSearchQuery}
          />
          <CommandList className="max-h-[200px]">
            {/* Show loading states */}
            {(isLoadingPlaylists || isSearching) && (
              <div className="flex items-center gap-2 justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isLoadingPlaylists ? 'Loading playlists...' : 'Searching...'}
              </div>
            )}

            {/* Show error state */}
            {error && !isLoadingPlaylists && !isSearching && (
              <div className="flex items-center gap-2 justify-center py-4 text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Show empty state only when not loading and no results */}
            {isEmptyState && !error && (
              <CommandEmpty>
                {hasSearchQuery ? 'No playlists found matching your search.' : 'No playlists found.'}
              </CommandEmpty>
            )}

            {/* Show playlists when we have results and not loading */}
            {currentPlaylists.length > 0 && !isLoadingPlaylists && !isSearching && (
              <CommandGroup heading={hasSearchQuery ? "Search Results" : "Your Playlists"}>
                {currentPlaylists.map((playlist) => (
                  <CommandItem
                    key={playlist.id}
                    value={playlist.id}
                    onSelect={() => handlePlaylistSelect(playlist.id)}
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

