import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Check, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addDays, dateKey, formatDate, parseDate, today, useSliced, type Meal } from '@/lib/sliced-data';
import { Avatar, Modal } from './shared';

export function WeekCalendar({compact=false,onMeal,onCreate}: {compact?:boolean;onMeal:(m:Meal)=>void;onCreate:(date?:string)=>void}) {
  const {state,setState,group,notify}=useSliced(); const [offset,setOffset]=useState(0);const [selected,setSelected]=useState<string|null>(null);const [moveTo,setMoveTo]=useState('');
  const current=new Date();current.setHours(12,0,0,0);const monday=addDays(current,-((current.getDay()+6)%7)+offset*7);const days=Array.from({length:7},(_,i)=>addDays(monday,i));
  const commitments=state.commitments.filter(c=>c.groupId===group.id);const meals=state.meals.filter(m=>m.groupId===group.id);
  const selectedCommitment=commitments.find(c=>c.date===selected&&c.cookId==='you');
  const claim=()=>{
    if(!selected)return;
    const commitment={id:crypto.randomUUID(),groupId:group.id,cookId:'you',date:selected};
    setState(s=>{
      if(s.commitments.some(c=>c.groupId===group.id&&c.cookId==='you'&&c.date===selected))return s;
      return {...s,commitments:[...s.commitments,commitment]};
    });
    notify(`You are cooking on ${formatDate(selected,{weekday:'long',month:'short',day:'numeric'})}. Your group’s schedule has been updated.`);
    toast.success('Your day in the kitchen is saved');setSelected(null);
  };
  const cancel=()=>{
    if(!selectedCommitment)return;
    setState(s=>({...s,commitments:s.commitments.filter(c=>!(c.groupId===group.id&&c.cookId==='you'&&c.date===selected))}));
    notify(`Cooking plans changed: ${formatDate(selected!)} is open again.`);
    toast.success('Cooking commitment cancelled');setSelected(null);
  };
  const move=()=>{
    if(!selectedCommitment)return;
    if(!moveTo||moveTo<today()){toast.error('Choose today or a future date.');return;}
    if(commitments.some(c=>c.cookId==='you'&&c.date===moveTo&&c.date!==selected)||meals.some(m=>m.cookId==='you'&&m.date===moveTo)){toast.error('You are already cooking that day.');return;}
    setState(s=>{
      const commitment=s.commitments.find(c=>c.id===selectedCommitment.id);
      if(!commitment)return s;
      // Move one commitment and discard duplicate copies of its original day.
      const remaining=s.commitments.filter(c=>!(c.groupId===group.id&&c.cookId==='you'&&c.date===selected));
      return {...s,commitments:[...remaining,{...commitment,date:moveTo}]};
    });
    notify(`Your cooking day moved from ${formatDate(selected!)} to ${formatDate(moveTo)}.`);
    toast.success('Cooking day updated');setSelected(null);
  };
  return <><div className={compact?'':'panel p-5 sm:p-6'}><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><h2 className="section-heading">{compact?'A peek at your week':'Around the table this week'}</h2>{compact&&<span className="hidden rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground sm:inline">{formatDate(dateKey(monday))} – {formatDate(dateKey(days[6]))}</span>}</div><div className="flex items-center gap-2">{!compact&&<Button className="subtle-button mr-2 h-8 text-xs" variant="outline" onClick={()=>setOffset(0)}>This week</Button>}<button className="rounded-lg border bg-white p-1.5 hover:bg-secondary" aria-label="Previous week" onClick={()=>setOffset(v=>v-1)}><ChevronLeft size={16}/></button><button className="rounded-lg border bg-white p-1.5 hover:bg-secondary" aria-label="Next week" onClick={()=>setOffset(v=>v+1)}><ChevronRight size={16}/></button></div></div>{!compact&&<p className="mb-5 text-sm text-muted-foreground">{formatDate(dateKey(monday),{month:'long',day:'numeric'})} – {formatDate(dateKey(days[6]),{month:'long',day:'numeric',year:'numeric'})} · {group.name}</p>}<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{days.map(d=>{const key=dateKey(d);const dayMeals=meals.filter(m=>m.date===key);const dayClaims=commitments.filter(c=>c.date===key);const hasContent=dayMeals.length+dayClaims.length>0;const isToday=key===today();const past=key<today();return <div key={key} data-testid={`cooking-day-${key}`} className={`flex flex-col rounded-xl border p-3 ${compact?'min-h-36':'min-h-56'} ${isToday?'border-primary/35 bg-[#fff7f1]':'bg-white'} ${!hasContent?'border-dashed':''}`}><div className="mb-3 flex items-center justify-between"><span className={`text-[10px] font-semibold uppercase ${isToday?'text-primary':'text-muted-foreground'}`}>{d.toLocaleDateString('en-US',{weekday:'short'})}</span><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isToday?'bg-primary text-white':''}`}>{d.getDate()}</span></div>{dayMeals.map(m=><button onClick={()=>onMeal(m)} key={m.id} className="mb-2 flex flex-col items-start text-left"><div className="flex items-center gap-1.5"><Avatar person={state.people.find(p=>p.id===m.cookId)!} size={25}/><span className="text-[11px] font-semibold">{m.cookId==='you'?'You':state.people.find(p=>p.id===m.cookId)?.name.split(' ')[0]}</span></div>{!compact&&<img src={m.image} alt={m.name} className="my-2 h-16 w-full rounded-lg object-cover"/>}<p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground hover:text-primary">{m.name}</p></button>)}{dayClaims.map(c=><button key={c.id} disabled={c.cookId!=='you'||past} onClick={()=>{setSelected(key);setMoveTo(key);}} className="mb-2 text-left"><div className="flex items-center gap-1.5"><Avatar person={state.people.find(p=>p.id===c.cookId)!} size={25}/><span className="text-[11px] font-semibold">{c.cookId==='you'?'You':state.people.find(p=>p.id===c.cookId)?.name.split(' ')[0]}</span></div><p className="mt-2 text-[10px] text-primary">{c.cookId==='you'?'Your cooking day':'Meal coming soon'}</p></button>)}{!hasContent&&<button disabled={past} className="flex flex-1 flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary disabled:opacity-50" onClick={()=>{setSelected(key);setMoveTo(key);}}><span className="rounded-full bg-secondary p-1.5"><Plus size={14}/></span><span className="text-[10px]">{past?'No meal shared':'Who’s cooking?'}</span></button>}{hasContent&&!past&&!dayClaims.some(c=>c.cookId==='you')&&!dayMeals.some(m=>m.cookId==='you')&&!compact&&<button className="mt-auto pt-3 text-[10px] text-primary hover:underline" onClick={()=>{setSelected(key);setMoveTo(key);}}>+ I can cook too</button>}</div>;})}</div>{!compact&&<div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary"/>Today<span className="ml-3 h-2 w-2 rounded-full border border-dashed border-muted-foreground"/>Unclaimed — a little room for your cooking</div>}</div><Modal open={!!selected} onClose={()=>setSelected(null)} title={selectedCommitment?'Your day in the kitchen':'Make someone’s day'} description={selected?formatDate(selected,{weekday:'long',month:'long',day:'numeric'}):''}>{selectedCommitment?<div className="space-y-5"><div className="rounded-xl bg-accent p-4"><p className="text-sm leading-relaxed">You’re on the schedule. Ready to tell everyone what’s on the menu?</p></div><Button className="primary-button w-full" onClick={()=>{const date=selected!;setSelected(null);onCreate(date);}}>Announce your meal<ArrowUpRight size={16}/></Button><div className="field"><label htmlFor="change-day">Need a different day?</label><input id="change-day" type="date" min={today()} value={moveTo} onChange={e=>setMoveTo(e.target.value)}/></div><Button variant="outline" className="subtle-button w-full" onClick={move}>Change cooking day</Button><button className="w-full text-xs text-destructive underline" onClick={cancel}>Cancel my cooking commitment</button></div>:<div className="space-y-5"><p className="text-sm leading-relaxed text-muted-foreground">Take a turn in the kitchen for {group.name}. You can announce your meal now, or save the day and decide what to cook later.</p><Button className="primary-button w-full" onClick={claim}><Check size={16}/>I’ll cook this day</Button><Button variant="outline" className="subtle-button w-full" onClick={()=>{const date=selected!;setSelected(null);onCreate(date);}}>I already know what I’m making<ArrowUpRight size={16}/></Button></div>}</Modal></>;
}
