import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Plus, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSliced, type Meal } from '@/lib/sliced-data';
import { Shell } from '@/components/sliced/shell';
import { HomePage, MealsPage } from '@/components/sliced/home';
import { WeekCalendar } from '@/components/sliced/schedule';
import { GroupsPage } from '@/components/sliced/groups';
import { ProfilePage, DemoWelcome } from '@/components/sliced/profile';
import { MealDetail, MealForm } from '@/components/sliced/meals';
import { AvatarStack, Modal } from '@/components/sliced/shared';

export default function Index() {
  const {state,setState,group}=useSliced();const location=useLocation();const navigate=useNavigate();const [params,setParams]=useSearchParams();const [query,setQuery]=useState('');const [detail,setDetail]=useState<string|null>(null);const [form,setForm]=useState<{meal?:Meal;date?:string}|null>(null);
  const invitation=params.get('invite');const invited=state.groups.find(g=>g.token===invitation);
  const onMeal=(meal:Meal)=>setDetail(meal.id);const onCreate=(date?:string)=>setForm({date});
  if(!state.signedIn)return <DemoWelcome/>;
  let page;
  switch(location.pathname) {
    case '/schedule': page=<div className="space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-[30px] font-bold tracking-tight">A week of good things.</h1><p className="mt-2 text-sm text-muted-foreground">Take a turn, share a meal, and see what’s coming to your table.</p></div><Button className="primary-button h-11" onClick={()=>onCreate()}><Plus size={17}/>Share a meal</Button></div><WeekCalendar onMeal={onMeal} onCreate={onCreate}/><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#edf2e8] p-5"><div className="flex items-center gap-3"><CalendarDays className="text-[#496446]" size={24}/><div><p className="text-sm font-semibold">Your table, your rhythm.</p><p className="mt-1 text-xs text-muted-foreground">{group.rules}</p></div></div><button className="text-xs font-semibold text-[#496446] underline" onClick={()=>navigate('/groups')}>Manage group rules</button></div></div>;break;
    case '/meals':page=<MealsPage query={query} onMeal={onMeal} onCreate={onCreate}/>;break;
    case '/groups':page=<GroupsPage/>;break;
    case '/profile':page=<ProfilePage/>;break;
    default:page=<HomePage onMeal={onMeal} onCreate={onCreate}/>;
  }
  return <Shell query={query} setQuery={setQuery} onMeal={onMeal}>{page}{detail&&<MealDetail key={detail} mealId={detail} onClose={()=>setDetail(null)} onEdit={meal=>{setDetail(null);setForm({meal});}}/>}{form&&<MealForm open initial={form.meal} date={form.date} onClose={()=>setForm(null)}/>}<Modal open={!!invitation} onClose={()=>setParams({})} title={invited?`You’re invited to ${invited.name}`:'This table lives on another device'} description={invited?'A private circle, a shared meal, and a place for you.':'This is a local prototype invitation.'}>{invited?<div className="space-y-5"><img src={invited.image} alt={invited.name} className="h-40 w-full rounded-xl object-cover"/><p className="text-sm leading-relaxed text-muted-foreground">{invited.description}</p><AvatarStack ids={invited.members}/><Button className="primary-button w-full" onClick={()=>{setState(s=>({...s,groupId:invited.id,groups:s.groups.map(g=>g.id===invited.id?{...g,members:g.members.includes('you')?g.members:[...g.members,'you']}:g)}));setParams({});toast.success(`Welcome to ${invited.name}`);}}>{invited.members.includes('you')?'Return to this group':'Join this private group'}</Button><p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole size={12}/>Demo invitation · available on this device</p></div>:<div className="space-y-5"><p className="text-sm leading-relaxed text-muted-foreground">We can’t find this group in your browser’s demo data. Invitations across devices will work after real accounts and a database are connected.</p><Button className="primary-button w-full" onClick={()=>setParams({})}>Explore my demo groups</Button></div>}</Modal></Shell>;
}
