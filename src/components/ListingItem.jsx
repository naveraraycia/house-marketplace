import {Link} from 'react-router-dom'
import {ReactComponent as DeleteIcon} from '../assets/svg/deleteIcon.svg'
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'
// import edit icon for edit listing functionality
import {ReactComponent as EditIcon} from '../assets/svg/editIcon.svg'

// ListingItem takes in props from Category.jsx
// onDelete is used for the Profile.jsx
function ListingItem( {listing, id, onDelete, onEdit} ) {
  return (
   <li className="categoryListing">
    {/* listing.type === either rent or sale */}
    {/* ${id} is what we got from the props (ID from the listing item generated back in Category.jsx) */}
    <Link to={`/category/${listing.type}/${id}`} className='categoryListingLink'>
      {/* src={listing.imgUrls[0]} means only get the first image [index 0] from the uploaded listing imgUrls  */}
      <img src={listing.imgUrls[0]} alt={listing.name} className='categoryListingImg' />

      <div className="categoryListingDetails">
        <p className="categoryListingLocation">
          {/* listing.location => full address of the listing (gathered from the listing object) */}
          {listing.location}  
        </p>

        <p className="categoryListingName">{listing.name}</p>
        <p className="categoryListingPrice">
          {/* depends whether there is an Offer */}
          {/* if offer is true then show discounted price, if there is no offer (false) then show regular price  */}
          {/* the money sign here is literally $ for the pricing, and not used for variable or expression block */}

          {/* Use regular expression to fix the digit format */}
          {/* convert first the price to a string data type */}
          {/* Regular expression used to place commas */}
          ${listing.offer ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }

          {/* Determine if it is for rent, if it is for rent then add the text 'per month ' or '/Month' */}
          {listing.type === 'rent' && ' /Month'}
        </p>

        <div className="categoryListingInfoDiv">
          <img src={bedIcon} alt="bed" />
          <p className="categoryListingInfoText">
            {/* Conditional => determine if there is more than 1 bedroom, if yes then output the number of bedrooms plus the PLURAL word 'Bedrooms */}
            {/* If listing.bedrooms <= 1 then there is only '1 Bedroom' SINGULAR */}
            {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : '1 Bedroom'}
          </p>

          <img src={bathtubIcon} alt="bath" />
          <p className="categoryListingInfoText">
          {listing.bathrooms > 1 ? `${listing.bedrooms} Bathrooms` : '1 Bathroom'}
          </p>
        </div>
      </div>
    </Link>

    {/* If you are using this component for 'Profile.jsx' then evaluate onDelete whether true or false, if true (in profile page) then add the DELETE ICON */}
    {onDelete && (
      // onClick event calls the onDelete function and then this takes in the listing ID and listing name from the props 'listing'
      <DeleteIcon className='removeIcon' fill='rgb(231,76,60)' onClick={() => onDelete(listing.id, listing.name)} />
    ) }

    {/* check if onEdit has been passed in or has content (this having content means it has been clicked) */}
    {/* if onEdit has content then show the edit icon, onClick it will call the function onClick with arg => id */}
    {onEdit && <EditIcon className='editIcon' onClick={()=> onEdit(id)} />}
   </li>
  )
}

export default ListingItem