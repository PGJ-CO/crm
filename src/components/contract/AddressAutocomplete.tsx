import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibmV2ZXJzdW1tZXI3NCIsImEiOiJjbW1oNDZ1bjYwYmIwMnFwdG8wMzMzaWJ5In0.-6ODr_GW3H4wfKpkQtrgbA";

interface AddressSuggestion {
  place_name: string;
  address?: string;
  text?: string;
  context?: { id: string; text: string; short_code?: string }[];
}

interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Props {
  value: string;
  onChange: (parsed: ParsedAddress) => void;
  placeholder?: string;
}

function parseFeature(feature: AddressSuggestion): ParsedAddress {
  const ctx = feature.context || [];
  const get = (prefix: string) =>
    ctx.find((c) => c.id.startsWith(prefix))?.text || "";
  const getShort = (prefix: string) =>
    ctx.find((c) => c.id.startsWith(prefix))?.short_code?.replace("US-", "") || get(prefix);

  return {
    street: feature.address ? `${feature.address} ${feature.text}` : feature.text || "",
    city: get("place"),
    state: getShort("region"),
    zip: get("postcode"),
  };
}

export default function AddressAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = (q: string) => {
    clearTimeout(debounceRef.current);
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&country=us&types=address,place&autocomplete=true&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelect = (s: AddressSuggestion) => {
    setQuery(s.place_name);
    setOpen(false);
    setSuggestions([]);
    onChange(parseFeature(s));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder || "Start typing an address…"}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-60 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{s.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
