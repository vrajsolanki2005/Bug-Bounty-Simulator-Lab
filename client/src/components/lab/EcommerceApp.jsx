import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { 
  ShoppingCart, Search, User, Package, ShieldCheck, Star, 
  ArrowLeft, Trash2, CreditCard, LayoutDashboard, Settings, 
  Menu, LogOut, ChevronRight, CheckCircle, AlertTriangle 
} from 'lucide-react'

export default function EcommerceApp({ onFlagCaptured }) {
  const [view, setView] = useState('shop') // shop, product, cart, checkout, orders, admin, profile, login
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [searchMsg, setSearchMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // Start logged in for demo
  const [adminStats, setAdminStats] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/shop/products')
      setProducts(data.data)
    } catch (err) { toast.error('Failed to load products') }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.get(`/shop/search?q=${search}`)
      setProducts(data.data)
      setSearchMsg(data.message) // Reflected XSS here
      if (data.flag) onFlagCaptured(data.flag)
    } catch (err) { toast.error('Search error') }
  }

  const addToCart = (product) => {
    setCart(prev => [...prev, { ...product, cartId: Date.now() }])
    toast.success(`${product.name} added to cart`)
  }

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId))
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    const total = cart.reduce((acc, item) => acc + parseFloat(item.price), 0)
    // Note: Vulnerability is that totalAmount is sent from client and can be tampered
    try {
      const { data } = await api.post('/shop/checkout', { cartItems: cart, totalAmount: total })
      if (data.success) {
        toast.success('Order placed successfully!')
        setCart([])
        setView('orders')
        if (data.flag) onFlagCaptured(data.flag)
      }
    } catch (err) { toast.error('Checkout failed') }
  }

  const postReview = async (e) => {
    e.preventDefault()
    const comment = e.target.comment.value
    try {
      const { data } = await api.post('/shop/review', { productId: selectedProduct.id, rating: 5, comment })
      if (data.success) {
        toast.success('Review posted!')
        e.target.reset()
        if (data.flag) onFlagCaptured(data.flag)
      }
    } catch (err) { toast.error('Failed to post review') }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const username = e.target.username.value
    try {
      const { data } = await api.post('/shop/profile/update', { email, username })
      toast.success(data.message)
      if (data.flag) onFlagCaptured(data.flag)
    } catch { toast.error('Update failed') }
  }

  const fetchAdminStats = async () => {
    try {
      const { data } = await api.get('/shop/admin/stats')
      setAdminStats(data.stats)
      if (data.flag) onFlagCaptured(data.flag)
      setView('admin')
    } catch (err) {
      toast.error('Access Denied: Admin role required')
    }
  }

  return (
    <div style={{ backgroundColor: '#fff', color: '#0f172a', borderRadius: '12px', minHeight: '650px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header (Amazon Style) */}
      <header style={{ backgroundColor: '#131921', color: '#fff', padding: '0.5rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 900, fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }} onClick={() => { setView('shop'); setSearchMsg(''); fetchProducts(); }}>
            <ShieldCheck size={28} color="#febd69" />
            VULN<span style={{ color: '#febd69' }}>SHOP</span>
          </div>

          {/* Delivery Info (Mock) */}
          <div style={{ fontSize: '0.75rem', display: 'none' }}>
            <div style={{ color: '#ccc' }}>Deliver to</div>
            <div style={{ fontWeight: 'bold' }}>Hacker City</div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', height: '40px' }}>
            <select style={{ backgroundColor: '#f3f3f3', border: 'none', borderRadius: '4px 0 0 4px', padding: '0 0.5rem', fontSize: '0.75rem', cursor: 'pointer', borderRight: '1px solid #ddd' }}>
              <option>All Departments</option>
              <option>Electronics</option>
              <option>Books</option>
            </select>
            <input 
              style={{ flex: 1, border: 'none', padding: '0 1rem', fontSize: '1rem', outline: 'none' }}
              placeholder="Search VulnShop"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button style={{ backgroundColor: '#febd69', border: 'none', borderRadius: '0 4px 4px 0', padding: '0 1rem', cursor: 'pointer' }}>
              <Search size={20} color="#333" />
            </button>
          </form>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => setView('profile')}>
              <div style={{ fontSize: '0.75rem' }}>Hello, User</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>Account & Lists <ChevronRight size={14}/></div>
            </div>
            
            <div style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => setView('orders')}>
              <div style={{ fontSize: '0.75rem' }}>Returns</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>& Orders</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem', cursor: 'pointer', position: 'relative' }} onClick={() => setView('cart')}>
              <ShoppingCart size={24} />
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Cart</div>
              {cart.length > 0 && <span style={{ position: 'absolute', top: '0', left: '22px', backgroundColor: '#f08804', color: '#fff', fontSize: '0.7rem', padding: '1px 5px', borderRadius: '10px' }}>{cart.length}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Nav */}
      <nav style={{ backgroundColor: '#232f3e', color: '#fff', padding: '0.5rem 1rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Menu size={18}/> All</div>
        <div style={{ cursor: 'pointer' }}>Today's Deals</div>
        <div style={{ cursor: 'pointer' }}>Customer Service</div>
        <div style={{ cursor: 'pointer' }}>Registry</div>
        <div style={{ cursor: 'pointer' }}>Gift Cards</div>
        <div style={{ cursor: 'pointer' }}>Sell</div>
      </nav>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#eaeded' }}>
        
        {/* Reflected XSS Message */}
        {searchMsg && (
          <div style={{ backgroundColor: '#fff', padding: '1rem 2rem', borderBottom: '1px solid #ddd' }}>
             <span dangerouslySetInnerHTML={{ __html: searchMsg }} />
          </div>
        )}

        {view === 'shop' && (
          <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1rem' }}>
            {/* Hero Section */}
            <div style={{ height: '200px', background: 'linear-gradient(to bottom, #86d4e2, #eaeded)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '2rem', fontWeight: 900, color: '#232f3e' }}>Cyber Monday Deals Every Day.</div>
            </div>

            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {products.map(p => (
                <div key={p.id} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => { setSelectedProduct(p); setView('product') }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', height: '3rem', overflow: 'hidden' }}>{p.name}</h3>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <img src={p.image_url} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', verticalAlign: 'top' }}>$</span>{p.price}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#007185' }}>Get it as soon as Tomorrow</div>
                    <div style={{ fontSize: '0.8rem', color: '#565959' }}>FREE Shipping on orders over $35</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'product' && selectedProduct && (
          <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ maxWidth: '100%', maxHeight: '500px' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.2, marginBottom: '0.5rem' }}>{selectedProduct.name}</h1>
                <div style={{ color: '#007185', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.5rem' }}>Visit the Store</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffa41c', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  <span style={{ color: '#007185', fontSize: '0.85rem', marginLeft: '0.5rem' }}>42 ratings</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '1rem 0' }} />
                <div style={{ fontSize: '1.8rem', fontWeight: 400 }}>
                   <span style={{ fontSize: '0.8rem', verticalAlign: 'top', marginTop: '4px' }}>$</span>{selectedProduct.price}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#565959', marginTop: '0.5rem' }}>$42.00 Shipping & Import Fees Deposit to United States</div>
                
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginTop: '2rem', width: '250px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${selectedProduct.price}</div>
                  <div style={{ fontSize: '0.85rem', color: '#007600', fontWeight: 'bold', margin: '0.5rem 0' }}>In Stock.</div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Quantity: 1</div>
                  <button 
                    onClick={() => addToCart(selectedProduct)}
                    style={{ width: '100%', backgroundColor: '#ffd814', border: '1px solid #fcd200', borderRadius: '20px', padding: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 500 }}
                  >Add to Cart</button>
                  <button 
                    style={{ width: '100%', backgroundColor: '#ffa41c', border: '1px solid #ff8f00', borderRadius: '20px', padding: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
                  >Buy Now</button>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontWeight: 'bold' }}>Customer Reviews</h3>
                  <form onSubmit={postReview} style={{ marginTop: '1rem' }}>
                    <textarea 
                      name="comment"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }} 
                      placeholder="Write a review..."
                    />
                    <button style={{ backgroundColor: '#232f3e', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', marginTop: '0.5rem', cursor: 'pointer' }}>Submit</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 500, borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1rem' }}>Shopping Cart</h2>
              {cart.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Your cart is empty.</div>
              ) : (
                cart.map(item => (
                  <div key={item.cartId} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                    <img src={item.image_url} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.name}</div>
                      <div style={{ color: '#007600', fontSize: '0.8rem' }}>In Stock</div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#007185' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item.cartId)}>Delete</span>
                        <span style={{ borderLeft: '1px solid #ddd', paddingLeft: '1rem', cursor: 'pointer' }}>Save for later</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${item.price}</div>
                  </div>
                ))
              )}
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', height: 'fit-content' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Subtotal ({cart.length} items): <span style={{ fontWeight: 'bold' }}>${cart.reduce((a, b) => a + parseFloat(b.price), 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setView('checkout')}
                style={{ width: '100%', backgroundColor: '#ffd814', border: '1px solid #fcd200', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
              >Proceed to Checkout</button>
            </div>
          </div>
        )}

        {view === 'checkout' && (
          <div style={{ maxWidth: '800px', margin: '2rem auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Review your order</h2>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                 <div>Items ({cart.length}):</div>
                 <div>${cart.reduce((a, b) => a + parseFloat(b.price), 0).toFixed(2)}</div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b12704', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                 <div>Order total:</div>
                 <div>${cart.reduce((a, b) => a + parseFloat(b.price), 0).toFixed(2)}</div>
               </div>
               <p style={{ fontSize: '0.75rem', color: '#565959', margin: '1rem 0' }}>By placing your order, you agree to VulnShop's privacy notice and conditions of use.</p>
               <button 
                onClick={handleCheckout}
                style={{ width: '100%', backgroundColor: '#ffd814', border: '1px solid #fcd200', borderRadius: '8px', padding: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
               >Place your order</button>
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Your Orders</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {[1, 2, 3].map(i => (
                 <div key={i} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f0f2f2', padding: '1rem', display: 'flex', gap: '2rem', fontSize: '0.75rem', color: '#565959' }}>
                      <div>
                        <div>ORDER PLACED</div>
                        <div>October {i+10}, 2024</div>
                      </div>
                      <div>
                        <div>TOTAL</div>
                        <div>$42.00</div>
                      </div>
                      <div>
                        <div>SHIP TO</div>
                        <div style={{ color: '#007185', cursor: 'pointer' }}>User Name</div>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div>ORDER # 114-1234567-000000{i}</div>
                        <div style={{ color: '#007185', cursor: 'pointer' }} onClick={async () => {
                          try {
                            const { data } = await api.get(`/shop/order/${i}`)
                            if (data.flag) onFlagCaptured(data.flag)
                            toast.success(`Viewing Order Details for #${i}`)
                          } catch { toast.error('Access Denied: Not your order') }
                        }}>View order details</div>
                      </div>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ width: '80px', height: '80px', background: '#f5f5f5', borderRadius: '4px' }} />
                          <div>
                            <div style={{ color: '#007185', fontWeight: 'bold' }}>Delivered Oct {i+12}</div>
                            <div style={{ fontSize: '0.85rem' }}>Package was handed to resident</div>
                          </div>
                       </div>
                       <button style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>Buy it again</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>Your Account</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              
              {/* Profile Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Update Profile</h3>
                <form onSubmit={updateProfile}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>Username</label>
                    <input name="username" style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }} defaultValue="testuser" />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>Email</label>
                    <input name="email" style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }} defaultValue="test@example.com" />
                  </div>
                  <button style={{ backgroundColor: '#ffd814', border: '1px solid #fcd200', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer' }}>Save Changes</button>
                </form>
                <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#777' }}>
                   <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Warning: CSRF Protection Disabled.
                </div>
              </div>

              {/* Avatar Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Avatar Management</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Upload from Computer</div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const filename = e.target.filename.value;
                    try {
                      const { data } = await api.post('/shop/avatar/upload', { filename, filedata: '...' });
                      if (data.flag) onFlagCaptured(data.flag);
                      toast.success(data.message);
                    } catch { toast.error('Upload error') }
                  }}>
                    <input name="filename" placeholder="avatar.png" style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <button style={{ width: '100%', backgroundColor: '#f0f2f2', border: '1px solid #ddd', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer' }}>Upload</button>
                  </form>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fetch from URL (SSRF)</div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const url = e.target.url.value;
                    try {
                      const { data } = await api.post('/shop/image/fetch', { url });
                      if (data.flag) onFlagCaptured(data.flag);
                      toast.success(data.message);
                    } catch { toast.error('Fetch error') }
                  }}>
                    <input name="url" placeholder="http://example.com/img.jpg" style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <button style={{ width: '100%', backgroundColor: '#f0f2f2', border: '1px solid #ddd', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer' }}>Sync Asset</button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

        {view === 'admin' && adminStats && (
          <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                 <LayoutDashboard size={32} color="#b12704" />
                 <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Control Center</h1>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                 <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Gross Sales</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>${adminStats.sales}</div>
                 </div>
                 <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Active Users</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{adminStats.users}</div>
                 </div>
                 <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Server Uptime</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{adminStats.uptime}</div>
                 </div>
              </div>
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <ShieldCheck color="#d97706" />
                 <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                    <strong>Access Verified:</strong> You are currently viewing sensitive administrative data. All actions are logged.
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Amazon-style Footer */}
      <footer style={{ backgroundColor: '#232f3e', color: '#fff' }}>
        <div style={{ backgroundColor: '#37475a', padding: '1rem', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => window.scrollTo(0, 0)}>
          Back to top
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '1000px', margin: '0 auto', padding: '3rem 1rem' }}>
          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Get to Know Us</h4>
            <div style={{ fontSize: '0.85rem', color: '#ddd', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <span>Careers</span>
               <span>Blog</span>
               <span>About VulnShop</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Make Money with Us</h4>
            <div style={{ fontSize: '0.85rem', color: '#ddd', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <span>Sell products on VulnShop</span>
               <span>Become an Affiliate</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>VulnShop Payment Products</h4>
            <div style={{ fontSize: '0.85rem', color: '#ddd', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <span>VulnShop Business Card</span>
               <span>Shop with Points</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Let Us Help You</h4>
            <div style={{ fontSize: '0.85rem', color: '#ddd', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <span style={{ cursor: 'pointer' }} onClick={() => setView('orders')}>Your Account</span>
               <span style={{ cursor: 'pointer' }} onClick={() => setView('orders')}>Your Orders</span>
               <span style={{ cursor: 'pointer' }} onClick={fetchAdminStats}>Admin Portal</span>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#131a22', padding: '2rem', textAlign: 'center', borderTop: '1px solid #3a4553' }}>
           <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>VULNSHOP</div>
           <div style={{ fontSize: '0.75rem', color: '#999' }}>© 2024, VulnShop.com, Inc. or its affiliates. (Vulnerable Training Environment)</div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}} />
    </div>
  )
}
