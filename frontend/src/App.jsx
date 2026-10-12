import React, { useEffect, useState } from 'react';

const API = 'http://localhost:8080/api';
const blankMenu = { name: '', category: 'Food', price: '', available: true };
const blankOrder = { customerName: '', phone: '', itemName: '', quantity: 1, pickupTime: '', status: 'PLACED', notes: '' };
const statuses = ['PLACED','CONFIRMED','PREPARING','READY','PICKED_UP','CANCELLED'];

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}
function toLocalInput(value) {
  if (!value) return '';
  return String(value).slice(0,16);
}

export default function App() {
  const [tab, setTab] = useState('orders');
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuForm, setMenuForm] = useState(blankMenu);
  const [orderForm, setOrderForm] = useState(blankOrder);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true); setError('');
    try {
      const [m, o] = await Promise.all([request('/menu-items'), request('/orders')]);
      setMenu(m); setOrders(o);
    } catch (e) { setError(`Could not connect to the backend. Start Spring Boot on port 8080. ${e.message}`); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function saveMenu(e) {
    e.preventDefault(); setError('');
    try {
      const body = { ...menuForm, price: Number(menuForm.price) };
      await request(editingMenu ? `/menu-items/${editingMenu}` : '/menu-items', { method: editingMenu ? 'PUT' : 'POST', body: JSON.stringify(body) });
      setMenuForm(blankMenu); setEditingMenu(null); await refresh();
    } catch (e) { setError(`Menu item could not be saved: ${e.message}`); }
  }
  function editMenu(item) {
    setEditingMenu(item.id); setMenuForm({ name:item.name, category:item.category, price:item.price, available:item.available }); setTab('menu');
  }
  async function deleteMenu(id) {
    if (!confirm('Delete this menu item?')) return;
    try { await request(`/menu-items/${id}`, {method:'DELETE'}); await refresh(); }
    catch(e) { setError(`Delete failed: ${e.message}`); }
  }
  async function saveOrder(e) {
    e.preventDefault(); setError('');
    try {
      const body = { ...orderForm, quantity: Number(orderForm.quantity), pickupTime: orderForm.pickupTime };
      await request(editingOrder ? `/orders/${editingOrder}` : '/orders', { method: editingOrder ? 'PUT' : 'POST', body: JSON.stringify(body) });
      setOrderForm(blankOrder); setEditingOrder(null); await refresh();
    } catch(e) { setError(`Order could not be saved: ${e.message}`); }
  }
  function editOrder(o) {
    setEditingOrder(o.id);
    setOrderForm({ ...o, pickupTime:toLocalInput(o.pickupTime), notes:o.notes || '' });
    setTab('orders');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  async function deleteOrder(id) {
    if (!confirm('Delete this pre-order?')) return;
    try { await request(`/orders/${id}`, {method:'DELETE'}); await refresh(); }
    catch(e) { setError(`Delete failed: ${e.message}`); }
  }

  return <main className="shell">
    <header className="hero">
      <div><div className="eyebrow">ORDER AHEAD · PICK UP WITH EASE</div><h1>Pre-Order <span>&</span> Pickup</h1><p>Manage your menu, organise orders, and keep every pickup on track.</p></div>
      <div className="hero-mark" aria-hidden="true">↗</div>
    </header>
    <section className="stats">
      <article><span>Total orders</span><strong>{orders.length}</strong></article>
      <article><span>Awaiting pickup</span><strong>{orders.filter(o=>!['PICKED_UP','CANCELLED'].includes(o.status)).length}</strong></article>
      <article><span>Menu items</span><strong>{menu.length}</strong></article>
    </section>
    <nav className="tabs"><button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}>Pre-orders</button><button className={tab==='menu'?'active':''} onClick={()=>setTab('menu')}>Menu management</button><button className="refresh" onClick={refresh}>↻ Refresh</button></nav>
    {error && <div className="alert"><span>{error}</span><button onClick={()=>setError('')}>×</button></div>}
    {loading && <p className="muted">Loading records…</p>}
    {tab==='orders' ? <div className="layout">
      <section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">ORDER DETAILS</span><h2>{editingOrder?'Edit pre-order':'Create pre-order'}</h2></div><span className="step">01</span></div>
        <form onSubmit={saveOrder}>
          <label>Customer name<input required value={orderForm.customerName} onChange={e=>setOrderForm({...orderForm,customerName:e.target.value})} placeholder="e.g. Asha Kumar"/></label>
          <label>Phone number<input required value={orderForm.phone} onChange={e=>setOrderForm({...orderForm,phone:e.target.value})} placeholder="Contact number"/></label>
          <label>Menu item<select required value={orderForm.itemName} onChange={e=>setOrderForm({...orderForm,itemName:e.target.value})}><option value="">Choose an item</option>{menu.filter(m=>m.available).map(m=><option key={m.id} value={m.name}>{m.name} · ₹{m.price}</option>)}</select></label>
          <div className="two"><label>Quantity<input required type="number" min="1" value={orderForm.quantity} onChange={e=>setOrderForm({...orderForm,quantity:e.target.value})}/></label><label>Pickup date & time<input required type="datetime-local" value={orderForm.pickupTime} onChange={e=>setOrderForm({...orderForm,pickupTime:e.target.value})}/></label></div>
          <label>Status<select value={orderForm.status} onChange={e=>setOrderForm({...orderForm,status:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
          <label>Notes (optional)<textarea rows="2" value={orderForm.notes} onChange={e=>setOrderForm({...orderForm,notes:e.target.value})} placeholder="Special instructions…"/></label>
          {!menu.length && <p className="hint">Add a menu item in Menu management before creating an order.</p>}
          <div className="form-actions"><button className="primary" disabled={!menu.length}>{editingOrder?'Save changes':'＋ Create pre-order'}</button>{editingOrder&&<button type="button" className="secondary" onClick={()=>{setEditingOrder(null);setOrderForm(blankOrder)}}>Cancel</button>}</div>
        </form>
      </section>
      <section className="panel list-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE REGISTER</span><h2>Pickup orders <span className="count">{orders.length}</span></h2></div></div>
        {!orders.length ? <div className="empty"><div>▤</div><h3>No pre-orders yet</h3><p>Create your first order using the form.</p></div> : <div className="records">{[...orders].sort((a,b)=>String(a.pickupTime).localeCompare(String(b.pickupTime))).map(o=><article className="record" key={o.id}><div className="record-top"><div><span className="order-id">ORDER #{String(o.id).padStart(4,'0')}</span><h3>{o.customerName}</h3></div><span className={`status ${o.status.toLowerCase()}`}>{o.status.replace('_',' ')}</span></div><div className="record-info"><span>▣ {o.itemName} × {o.quantity}</span><span>◷ {String(o.pickupTime).replace('T',' ')}</span><span>☎ {o.phone}</span>{o.notes&&<span>✎ {o.notes}</span>}</div><div className="record-actions"><button onClick={()=>editOrder(o)}>Edit</button><button className="danger" onClick={()=>deleteOrder(o.id)}>Delete</button></div></article>)}</div>}
      </section>
    </div> : <div className="layout menu-layout">
      <section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">MENU CATALOGUE</span><h2>{editingMenu?'Edit menu item':'Add menu item'}</h2></div><span className="step">02</span></div>
        <form onSubmit={saveMenu}><label>Item name<input required value={menuForm.name} onChange={e=>setMenuForm({...menuForm,name:e.target.value})} placeholder="e.g. Veg sandwich"/></label><label>Category<input required value={menuForm.category} onChange={e=>setMenuForm({...menuForm,category:e.target.value})} placeholder="Snacks, Drinks…"/></label><label>Price (₹)<input required min="0.01" step="0.01" type="number" value={menuForm.price} onChange={e=>setMenuForm({...menuForm,price:e.target.value})} placeholder="0.00"/></label><label className="check"><input type="checkbox" checked={menuForm.available} onChange={e=>setMenuForm({...menuForm,available:e.target.checked})}/> Available for pre-order</label><div className="form-actions"><button className="primary">{editingMenu?'Save changes':'＋ Add menu item'}</button>{editingMenu&&<button type="button" className="secondary" onClick={()=>{setEditingMenu(null);setMenuForm(blankMenu)}}>Cancel</button>}</div></form>
      </section>
      <section className="panel list-panel"><div className="panel-heading"><div><span className="eyebrow">AVAILABLE SELECTION</span><h2>Menu items <span className="count">{menu.length}</span></h2></div></div>
        {!menu.length?<div className="empty"><div>◇</div><h3>Your menu starts here</h3><p>Add items so customers can pre-order.</p></div>:<div className="menu-grid">{menu.map(m=><article className="menu-card" key={m.id}><div className="menu-symbol">✳</div><span className={m.available?'available':'unavailable'}>{m.available?'AVAILABLE':'UNAVAILABLE'}</span><h3>{m.name}</h3><p>{m.category}</p><strong>₹{Number(m.price).toFixed(2)}</strong><div className="record-actions"><button onClick={()=>editMenu(m)}>Edit</button><button className="danger" onClick={()=>deleteMenu(m.id)}>Delete</button></div></article>)}</div>}
      </section>
    </div>}
    <footer><span>PRE-ORDER & PICKUP MANAGEMENT</span><span>React · Spring Boot · H2 Database</span></footer>
  </main>;
}
