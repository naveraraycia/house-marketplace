import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
// Pages
import Explore from './pages/Explore'
import Offers from './pages/Offers'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
// Import Navbar Component
import Navbar from './components/Navbar'
// Import toastify for alerts
import {ToastContainer} from 'react-toastify'
// Toastify CSS
import 'react-toastify/dist/ReactToastify.css'
// Import Private Route Component
import PrivateRoute from './components/PrivateRoute'
// Import Category page
import Category from './pages/Category'
// Import createListing
import CreateListing from './pages/CreateListing'
// import Listing page
import Listing from './pages/Listing'
// import contact page
import Contact from './pages/Contact'
// Edit Listing Page
import EditListing from './pages/EditListing'


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<Explore />} />
        <Route path='/offers' element={<Offers />} />
        {/* Category page */}
        <Route path='/category/:categoryName' element={<Category />} />
        {/* Private Route for profile */}
        <Route path='/profile' element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
        </Route>

        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/create-listing' element={<CreateListing />} />
        {/* Listing page */}
        <Route path='/category/:categoryName/:listingId' element={<Listing />} />
        {/* Contact Landlord page */}
        {/* landlordId => listing owner's ID */}
        <Route path='/contact/:landlordId' element={<Contact/>} />
        {/* Edit listing page */}
        <Route path='/edit-listing/:listingId' element={<EditListing />} />
      </Routes>
     {/* Navbar */}
     <Navbar />
    </Router>
     {/* toast */}

     <ToastContainer />
    </>
  );
}

export default App;
