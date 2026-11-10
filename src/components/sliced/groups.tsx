import { useState, type FormEvent } from 'react';
import { Plus, ArrowUpRight, LockKeyhole, Users, Link2, Check, Settings2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSliced, readImage, type Group, type Person } from '@/lib/sliced-data';
import { Avatar, AvatarStack, MemberModal, Modal, PrivateLabel } from './shared';

export function GroupForm({initial,onClose}: {initial?:Group;onClose:()=>void}) {
  const {setState,notify}=useSliced();const [name,setName]=useState(initial?.name||'');const [description,setDescription]=useState(initial?.description||'');const [rules,setRules]=useState(initial?.rules||'');const [image,setImage]=useState(initial?.image||'/images/friends.png');const [loading,setLoading]=useState(false);
  const submit=(e:FormEvent)=>{e.preventDefault();const id=initial?.id||crypto.randomUUID();const group:Group={id,name:name.trim(),description:description.trim(),rules:rules.trim(),image,members:initial?.members||['you'],token:initial?.token||crypto.randomUUID()};setState(s=>({...s,groups:initial?s.groups.map(g=>g.id===id?group:g):[...s.groups,group],groupId:id}));notify(initial?`${name}’s group details and rules have been updated.`:`You created ${name}. Invite your favorite people!`);toast.success(initial?'Group updated':'Your private table is ready');onClose();};
  return <Modal open onClose={onClose} title={initial?'Your table, your way':'Make room at your table'} description="Private by default. Only the people you invite can join."><form className="space-y-5" onSubmit={submit}><div className="field"><label htmlFor="group-name">Group name</label><input id="group-name" required maxLength={70} placeholder="e.g. The Wednesday Supper Club" value={name} onChange={e=>setName(e.target.value)}/></div><div className="field"><label htmlFor="group-description">A little about your group</label><textarea id="group-description" required maxLength={500} rows={3} placeholder="Who’s around your table?" value={description} onChange={e=>setDescription(e.target.value)}/></div><div><label className="mb-2 block">Cover photo</label><div className="relative overflow-hidden rounded-xl"><img src={image} alt="Group cover preview" className="h-36 w-full object-cover"/><label className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs"><ImagePlus size={15}/>{loading?'Uploading…':'Change photo'}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setLoading(true);try{setImage(await readImage(file));}catch(error){toast.error((error as Error).message);}finally{setLoading(false);}}}/></label></div><p className="mt-1 text-[11px] text-muted-foreground">Optional cover upload, maximum 2 MB.</p></div><div className="field"><label htmlFor="group-rules">Cooking schedules & house rules</label><textarea id="group-rules" required maxLength={1500} rows={4} placeholder="When do we cook? How do we share? Keep it friendly." value={rules} onChange={e=>setRules(e.target.value)}/></div><Button disabled={loading} type="submit" className="primary-button h-11 w-full">{initial?'Save group':'Create private group'}<ArrowUpRight size={16}/></Button></form></Modal>;
}
export function InviteModal({group,onClose}: {group:Group;onClose:()=>void}) {
  const [copied,setCopied]=useState(false);const link=`${window.location.origin}/groups?invite=${group.token}`;
  return <Modal open onClose={onClose} title="Good food is better together" description={`Invite a friend to ${group.name}.`}><div className="space-y-5"><div className="flex justify-center"><AvatarStack ids={group.members} limit={7}/></div><p className="text-center text-sm text-muted-foreground">Send this private invitation to someone you’d love to share a meal with.</p><div className="field"><label htmlFor="invite-link">Your invitation link</label><input id="invite-link" readOnly value={link} onFocus={e=>e.target.select()}/></div><Button className="primary-button w-full" onClick={async()=>{try{await navigator.clipboard.writeText(link);setCopied(true);toast.success('Invitation link copied');}catch{toast.info('Select the invitation link above to copy it.');}}}>{copied?<Check size={16}/>:<Link2 size={16}/>} {copied?'Link copied':'Copy invitation link'}</Button><div className="rounded-xl bg-secondary p-4 text-xs leading-relaxed text-muted-foreground"><LockKeyhole size={14} className="mb-2"/>Prototype note: invitations work with groups stored on this device. Sharing private groups across devices will require the future authentication and database integration.</div></div></Modal>;
}
export function GroupsPage() {
  const {state,setState,group}=useSliced();
  const [form,setForm]=useState<Group|'new'|null>(null);
  const [invite,setInvite]=useState<Group|null>(null);
  const [person,setPerson]=useState<Person|null>(null);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight">Your people. Your table.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a group to manage its details, members and house rules.</p>
      </div>
      <Button className="primary-button h-11" onClick={()=>setForm('new')}><Plus size={17}/>Create a group</Button>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4 sm:p-5">
      <div className="w-full sm:w-80">
        <label id="manage-group-label" className="mb-2 block text-xs font-semibold text-muted-foreground">Group to manage</label>
        <Select value={group.id} onValueChange={groupId=>{
          setForm(null);
          setInvite(null);
          setPerson(null);
          setState(s=>({...s,groupId}));
        }}>
          <SelectTrigger aria-labelledby="manage-group-label" className="h-11 rounded-xl border-border bg-secondary/50 px-3.5 text-sm font-semibold shadow-none">
            <span className="flex items-center gap-2"><Users size={16} className="text-primary"/><SelectValue/></span>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border p-1.5">
            {state.groups.filter(g=>g.members.includes('you')).map(g=><SelectItem key={g.id} value={g.id} className="rounded-lg py-2.5 text-sm focus:bg-accent focus:text-primary">{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <PrivateLabel/>
    </div>

    <article className="panel overflow-hidden">
      <img src={group.image} alt={group.name} className="h-44 w-full object-cover sm:h-56"/>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">{group.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{group.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="subtle-button text-xs" onClick={()=>setForm(group)}><Settings2 size={14}/>Edit group</Button>
            <Button className="primary-button text-xs" onClick={()=>setInvite(group)}><Link2 size={14}/>Invite a friend</Button>
          </div>
        </div>
      </div>
    </article>

    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <section className="panel p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="section-heading">Group members</h2>
          <span className="shrink-0 text-xs text-muted-foreground">{group.members.length} members</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {group.members.map(id=>{
            const p=state.people.find(p=>p.id===id)!;
            return <button className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-secondary" key={id} onClick={()=>setPerson(p)}>
              <Avatar person={p} size={40}/>
              <div><p className="text-xs font-semibold">{id==='you'?'You':p.name.split(' ')[0]}</p><p className="mt-1 text-[10px] text-muted-foreground">{p.dietary[0]||'Food lover'}</p></div>
            </button>;
          })}
        </div>
      </section>
      <section className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Our house rules</h2>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label={`Edit ${group.name} rules`} onClick={()=>setForm(group)}><Settings2 size={17}/></button>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{group.rules}</p>
        <div className="mt-5 border-t pt-4"><PrivateLabel/></div>
      </section>
    </div>
    {form&&<GroupForm key={form==='new'?'new':form.id} initial={form==='new'?undefined:form} onClose={()=>setForm(null)}/>}
    {invite&&<InviteModal group={invite} onClose={()=>setInvite(null)}/>}
    <MemberModal person={person} onClose={()=>setPerson(null)}/>
  </div>;
}
