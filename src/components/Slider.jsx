// for fetching images from document
import {useState, useEffect} from 'react'
// for redirecting user to listing URL upon clicking on the photo
import {useNavigate} from 'react-router-dom'
import {collection, getDocs, query, orderBy, limit} from 'firebase/firestore'
import {db} from '../firebase.config'
// Import swiper
import SwiperCore, {Navigation, Pagination, Scrollbar, A11y} from 'swiper'
import {Swiper, SwiperSlide} from 'swiper/react'
// import swiper css
import 'swiper/css'
// For the slide indicators
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/a11y';
// import spinner component
import Spinner from './Spinner'

function Slider() {
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)

  const navigate = useNavigate()

  // fetch the listing
  useEffect(()=>{

    // do async function for the 'await' in querySnap to work
    async function fetchListings() {
        // create reference to collection
        const listingsRef = collection(db, 'listings')
        // create query => gets the 5 latest listings
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
        // get query result / snapshot
        const querySnap = await getDocs(q)

        // initialize variable for listings [] array, we put here the individual results
        let listings = []

        querySnap.forEach((docItem)=>{
          return listings.push({
            id: docItem.id,
            data: docItem.data()
          })
        })

        // transfer array listings[] content to the state => 'listings'
        setListings(listings)
        // stop loading
        setLoading(false)
  }

  // Call the async function
  fetchListings()


  },[])


  // Check loading state for the spinner component
  if(loading) {
    return <Spinner />
  }

  // check if there are listings fetched to be shown on slider
  // if there are no listings to be shown then return an empty fragment (basically do not show a slider)
  if(listings.length === 0) {
    return <>
      {/* returning an empty fragment will prevent the page from having a big space (slider) with no photos */}
    </>
  }
  ////////////////////////////////////////
  return listings && (
    // check if there is content within 'listings' array
    // if there is => then construct the Slider HTML component
    <>
      <p className='exploreHeading'>Recommended</p>

      <Swiper modules={[Navigation, Pagination, Scrollbar, A11y]} slidesPerView={1} pagination={{clickable: true}} navigation style={{ height: '300px' }}>
          {/* loop through your imgUrls and output a swiper slide component for each index */}
          {/*  listings.map(({data, id})   => {data, id} is de-structured from the 'listings' array */}
          {listings.map(({data, id})=>{
           return ( <SwiperSlide key={id} onClick={()=> navigate(`/category/${data.type}/${id}`)}>
              <div style={{
                // ${data.imgUrls[0]} => gets only the first image per listing 
                background: `url(${data.imgUrls[0]}) center no-repeat`,
                backgroundSize: 'cover'}} 
                className="swiperSlideDiv">

                  <p className="swiperSlideText">{data.name}</p>
                  {/* ?? operator => means if the left side is null then show whats on the right */}
                  {/* if the left side is NOT NULL then show the left side */}
                  <p className="swiperSlidePrice">${data.discountedPrice ?? data.regularPrice}
                  {/* check if you will add the word 'per month' => check if listing is rent or sale*/}
                  {' '}{data.type === 'rent' && '/ month'}

                  </p>
                </div>
            </SwiperSlide>
           )
          })}
      </Swiper>
    </>
  )
}

export default Slider