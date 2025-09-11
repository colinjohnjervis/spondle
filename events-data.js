// Sample events for homepage / events page (50 items)
window.EVENTS = [
  {id:"ev-001",title:"The Harbourside Sessions",date:"2025-09-12",city:"Bristol",category:"Live Music",venue:"The Louisiana",priceLabel:"Free Entry",image:"https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1600&auto=format&fit=crop"},
  {id:"ev-002",title:"Acoustic Sessions at The Fleece",date:"2025-09-21",city:"Bristol",category:"Live Music",venue:"The Fleece",priceLabel:"£8",image:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop"},
  {id:"ev-003",title:"Family Science Day",date:"2025-09-28",city:"Manchester",category:"Community",venue:"Science & Industry Museum",priceLabel:"£6",image:"https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=1600&auto=format&fit=crop"},
];

// auto-extend to 50 realistic rows
(function seedMore(){
  const pics=[
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520975922203-bc1e37a1c9c5?q=80&w=1600&auto=format&fit=crop"
  ];
  const cats=["Comedy","Food & Drink","Film","Community","Theatre","Live Music"];
  const cities=["Bristol","Leeds","Cardiff","Manchester","Edinburgh","Liverpool","Glasgow","London"];
  let i = window.EVENTS.length + 1;
  for (; i <= 50; i++){
    const img=pics[i%pics.length], cat=cats[i%cats.length], city=cities[i%cities.length];
    const day=((i%28)+1).toString().padStart(2,'0');
    window.EVENTS.push({
      id:`ev-${i.toString().padStart(3,'0')}`,
      title:`${cat} Night #${i}`,
      date:`2025-10-${day}`,
      city, category:cat,
      venue:`${city} Arts Hub`,
      priceLabel:(i%3===0)?"Free Entry":`£${(i%5+5)}`,
      image:img
    });
  }
})();
