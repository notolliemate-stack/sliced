import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { createDefaultAvatar } from './default-avatar';

export type Person = { id: string; name: string; avatar: string; dietary: string[]; allergies: string; email?: string };
export type Group = { id: string; name: string; description: string; image: string; members: string[]; rules: string; token: string };
export type Meal = { id: string; groupId: string; cookId: string; name: string; description: string; image: string; date: string; time: string; portions: number; dietary: string[]; allergens: string; arrangement: string; notes: string; reservations: Record<string, number> };
export type Commitment = { id: string; groupId: string; cookId: string; date: string };
export type Notice = { id: string; text: string; time: string; read: boolean; mealId?: string };
type State = { people: Person[]; groups: Group[]; meals: Meal[]; commitments: Commitment[]; notices: Notice[]; groupId: string; signedIn: boolean };
export const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const addDays = (d: Date, n: number) => { const result = new Date(d); result.setDate(result.getDate()+n); return result; };
export const parseDate = (value: string) => new Date(`${value}T12:00:00`);
export const formatDate = (value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) => parseDate(value).toLocaleDateString('en-US', options);
export const today = () => dateKey(new Date());
export const isUpcoming = (m: Meal) => new Date(`${m.date}T${m.time}`) >= new Date();
export const available = (meal: Meal) => meal.portions - Object.values(meal.reservations).reduce((a,b) => a+b,0);
export const timeLabel = (time: string) => new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
function seed(): State {
  const day = (n: number) => dateKey(addDays(new Date(),n));
  return {
    signedIn: false, groupId: 'supper',
    people: [
      {id:'you',name:'Alex Morgan',avatar:createDefaultAvatar(),dietary:[],allergies:'',email:'alex@example.com'},
      {id:'emma',name:'Emma Wilson',avatar:createDefaultAvatar(),dietary:['Vegetarian'],allergies:'Peanuts'},
      {id:'james',name:'James Chen',avatar:createDefaultAvatar(),dietary:[],allergies:''},
      {id:'sophie',name:'Sophie Patel',avatar:createDefaultAvatar(),dietary:['Vegan'],allergies:'Dairy'},
      {id:'oliver',name:'Oliver Brooks',avatar:createDefaultAvatar(),dietary:[],allergies:''},
      {id:'mia',name:'Mia Thompson',avatar:createDefaultAvatar(),dietary:['Gluten-free'],allergies:'Gluten'},
      {id:'dan',name:'Daniel Rivera',avatar:createDefaultAvatar(),dietary:[],allergies:''},
    ],
    groups: [
      {id:'supper',name:'The Supper Club',description:'Good friends, home-cooked meals, and one less thing to think about. Our little neighborhood table.',image:'/images/friends.png',members:['you','emma','james','sophie','oliver','mia','dan'],rules:'Cook when you can. Reserve by noon on the day of the meal. Bring your own container, and always list allergens. No one keeps score — just share the love.',token:'supper-club-demo'},
      {id:'family',name:'Family Table',description:'A little taste of home, shared with the people we love most.',image:'/images/chicken.png',members:['you','mia','dan'],rules:'Sunday is family dinner. Let us know if you cannot make it. Everyone helps with the washing up!',token:'family-table-demo'},
    ],
    meals: [
      {id:'pasta',groupId:'supper',cookId:'emma',name:'Creamy tomato & basil pasta',description:'My go-to comfort food! Slow-roasted tomatoes, a silky sauce, and a very generous handful of fresh basil. Made with love (and a little extra parmesan).',image:'/images/pasta.png',date:day(0),time:'19:00',portions:6,dietary:['Vegetarian'],allergens:'Wheat, milk',arrangement:'Collection',notes:'Bring a container. Pick up from my place between 6:30 and 7:30 pm.',reservations:{james:1,mia:1,dan:1}},
      {id:'chicken',groupId:'supper',cookId:'james',name:'Lemon & herb roast chicken',description:'Golden roast chicken with lemon, rosemary, and a big tray of seasonal vegetables. A proper home-cooked feast.',image:'/images/chicken.png',date:day(1),time:'18:30',portions:7,dietary:['Gluten-free'],allergens:'None',arrangement:'Shared dining',notes:'Come over at 6:30. We will eat together in the garden if the weather is nice.',reservations:{emma:1,oliver:1}},
      {id:'curry',groupId:'supper',cookId:'sophie',name:'Sweet potato & chickpea curry',description:'A warming coconut curry with roasted sweet potato, chickpeas, fresh cilantro, and fluffy basmati rice. Mild spice, big flavor.',image:'/images/curry.png',date:day(2),time:'19:00',portions:5,dietary:['Vegan','Gluten-free'],allergens:'Coconut',arrangement:'Collection',notes:'I can leave your portion at the door. Just message me when you are on your way.',reservations:{emma:1,dan:1}},
      {id:'past',groupId:'supper',cookId:'you',name:'Sunday roast with all the trimmings',description:'A lovely afternoon around the table with everyone.',image:'/images/chicken.png',date:day(-3),time:'13:00',portions:7,dietary:['Gluten-free'],allergens:'Milk',arrangement:'Shared dining',notes:'Thank you for coming!',reservations:{emma:1,james:1,sophie:1}},
      {id:'familymeal',groupId:'family',cookId:'mia',name:'Our favorite Sunday pasta',description:'The family recipe, with plenty to go around.',image:'/images/pasta.png',date:day(3),time:'18:00',portions:5,dietary:['Vegetarian'],allergens:'Wheat, milk',arrangement:'Shared dining',notes:'Dinner at my place.',reservations:{dan:1}},
    ],
    commitments:[{id:'c1',groupId:'supper',cookId:'you',date:day(4)}],
    notices:[{id:'n1',text:'Emma announced creamy tomato & basil pasta. There is a place for you!',time:new Date().toISOString(),read:false,mealId:'pasta'},{id:'n2',text:'Sophie is cooking sweet potato & chickpea curry this week.',time:new Date().toISOString(),read:false,mealId:'curry'}],
  };
}
function load(): State {
  try {
    const stored = localStorage.getItem('sliced-demo-v1');
    if(stored) {
      const state: State = JSON.parse(stored);
      state.people = state.people.map(person => !person.avatar || /^https:\/\/i\.pravatar\.cc\/100\?img=\d+$/.test(person.avatar)
        ? {...person, avatar: createDefaultAvatar()}
        : person);
      return state;
    }
  } catch { /* Use sample data when storage is unavailable. */ }
  return seed();
}
type Store = { state: State; setState: React.Dispatch<React.SetStateAction<State>>; me: Person; group: Group; notify: (text: string, mealId?: string) => void; reserve: (id: string, portions: number) => void; cancelReservation: (id: string) => void; };
const Context = createContext<Store | null>(null);
export function SlicedProvider({children}: {children: ReactNode}) {
  const [state,setState] = useState<State>(load);
  useEffect(()=>{ try { localStorage.setItem('sliced-demo-v1',JSON.stringify(state)); } catch { toast.error('Device storage is full. Recent changes cannot be saved.'); } },[state]);
  const me = state.people.find(p=>p.id==='you')!;
  const group = state.groups.find(g=>g.id===state.groupId) || state.groups[0];
  const notify = (text: string, mealId?: string) => setState(s=>({...s,notices:[{id:crypto.randomUUID(),text,mealId,time:new Date().toISOString(),read:false},...s.notices]}));
  const reserve = (id: string, portions: number) => {
    const meal = state.meals.find(m=>m.id===id);
    if (!meal || !isUpcoming(meal) || meal.cookId==='you' || !Number.isInteger(portions) || portions<1 || portions>available(meal) || meal.reservations.you) { toast.error('Those portions are no longer available.'); return; }
    const notice: Notice = {id:crypto.randomUUID(),text:`You reserved ${portions} ${portions===1?'portion':'portions'} of ${meal.name}.`,time:new Date().toISOString(),read:false,mealId:id};
    setState(s=>{
      const latest = s.meals.find(m=>m.id===id);
      if(!latest || !isUpcoming(latest) || latest.reservations.you || portions>available(latest)) return s;
      return {...s,meals:s.meals.map(m=>m.id===id?{...m,reservations:{...m.reservations,you:portions}}:m),notices:[notice,...s.notices]};
    });
    toast.success('A little goodness is coming your way!');
  };
  const cancelReservation = (id: string) => { setState(s=>({...s,meals:s.meals.map(m=>{ if(m.id!==id) return m; const reservations={...m.reservations}; delete reservations.you; return {...m,reservations}; })})); notify('Your reservation was cancelled. Portions are available to your group again.',id); toast.success('Reservation cancelled'); };
  return <Context.Provider value={{state,setState,me,group,notify,reserve,cancelReservation}}>{children}</Context.Provider>;
}
export function useSliced() { const store=useContext(Context); if(!store) throw new Error('SlicedProvider is required'); return store; }
export const dietaryOptions = ['Vegetarian','Vegan','Gluten-free','Dairy-free'];
export async function readImage(file: File): Promise<string> {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if(file.size>2*1024*1024) throw new Error('Choose an image smaller than 2 MB.');
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read this image.'));reader.readAsDataURL(file);});
}
