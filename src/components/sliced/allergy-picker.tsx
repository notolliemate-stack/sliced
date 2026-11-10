import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const allergyOptions = [
  'Milk (dairy)', 'Eggs', 'Peanuts', 'Almonds', 'Cashews',
  'Walnuts', 'Hazelnuts', 'Pistachios', 'Fish', 'Shellfish (crustaceans)',
  'Molluscs', 'Wheat', 'Gluten', 'Soy', 'Sesame',
  'Mustard', 'Celery', 'Lupin', 'Sulphites', 'Coconut',
];

export function AllergyPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [selection, setSelection] = useState(() => {
    const entries = value.split(',').map(entry => entry.trim()).filter(Boolean);
    const selected = allergyOptions.filter(option => entries.some(entry => entry.toLowerCase() === option.toLowerCase()));
    const custom = entries.filter(entry => !selected.some(option => option.toLowerCase() === entry.toLowerCase())).join(', ');
    return { selected, other: !!custom, custom };
  });

  const update = (next: typeof selection) => {
    setSelection(next);
    onChange([...next.selected, ...(next.other && next.custom.trim() ? [next.custom.trim()] : [])].join(', '));
  };

  return <div className="field">
    <label htmlFor="profile-allergies">Allergies & food restrictions</label>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button id="profile-allergies" type="button" variant="outline" aria-label="Choose allergies" className="subtle-button h-auto min-h-11 w-full justify-between gap-3 px-3.5 py-3 text-left text-sm font-normal">
          <span className="min-w-0 whitespace-normal">{selection.selected.length || selection.other
            ? [...selection.selected, ...(selection.other ? ['Other'] : [])].join(', ')
            : 'Select allergies or food restrictions'}</span>
          <ChevronDown size={16} className="shrink-0 text-muted-foreground"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-60 rounded-xl border-border p-1.5 shadow-lg">
        <div className="max-h-60 overflow-y-auto">
          {allergyOptions.map(option => <DropdownMenuCheckboxItem
            key={option}
            checked={selection.selected.includes(option)}
            onSelect={event => event.preventDefault()}
            onCheckedChange={checked => update({ ...selection, selected: checked
              ? [...selection.selected, option]
              : selection.selected.filter(item => item !== option) })}
            className="cursor-pointer rounded-lg py-2.5 text-sm focus:bg-accent focus:text-primary"
          >{option}</DropdownMenuCheckboxItem>)}
        </div>
        <DropdownMenuSeparator/>
        <DropdownMenuCheckboxItem
          checked={selection.other}
          onSelect={event => event.preventDefault()}
          onCheckedChange={checked => update({ ...selection, other: !!checked })}
          className="cursor-pointer rounded-lg py-2.5 text-sm focus:bg-accent focus:text-primary"
        >Other</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator/>
        <DropdownMenuItem className="cursor-pointer justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-primary focus:bg-accent"><Check size={14}/>Done</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <p className="text-[11px] text-muted-foreground">Select all that apply. Choose Other for an allergy or restriction not listed.</p>
    {selection.other && <div className="field mt-2 rounded-xl border border-primary/15 bg-accent/30 p-4">
      <label htmlFor="profile-other-allergy">Other allergy or food restriction</label>
      <input id="profile-other-allergy" required maxLength={500} placeholder="e.g. Kiwi, mango, or another restriction" value={selection.custom} onChange={event => update({ ...selection, custom: event.target.value })}/>
    </div>}
  </div>;
}
