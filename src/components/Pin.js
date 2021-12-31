import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { MdDownload } from 'react-icons/md'
import { AiTwotoneDelete } from 'react-icons/ai'

import { client, urlFor } from '../client'
import { fetchUser } from '../utils/fetchUser'

const Pin = ({ pin: {postedBy, image, _id, save} }) => {

    const [postHovered, setPostHovered] = useState(false)
    const navigate = useNavigate()
    const user = fetchUser()

    const alreadySaved = !!(save?.filter((item) => item.postedBy._id === user?.googleId))?.length

    const savePin = (id) => {
        if(!alreadySaved) {

            client
                .patch(id)
                .setIfMissing({ save : [] })
                .insert('after', 'save[-1]', [{
                    _key: uuidv4(),
                    userId: user?.googleId,
                    postedBy: {
                        _type: 'postedBy',
                        _ref: user?.googleId
                    }
                }])
                .commit()
                .then(() => {
                    window.location.reload()
                })
        }
    }

    const deletePin = (id) => {
        client
        .delete(id)
        .then(() => {
            window.location.reload()
        })
    }
    //  !!
    // 1, [2, 3, 1] -> [1].length -> 1 -> !1 -> false -> !false -> true
    // 4, [2, 3, 1] -> [].length -> 0 -> !0 -> true -> !true -> false

    return (
        <div className="mx-1 my-2" >
            <div className="relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
                onMouseEnter={() => setPostHovered(true)}
                onMouseLeave={() => setPostHovered(false)}
                onClick={() => navigate(`/pin-detail/${_id}`)}
            >
            <img className="rounded-lg w-full" src={(urlFor(image).width(500).url())} alt="user-post" />
            {postHovered && (
                <div className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
                    style={{ height: '100%' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <a 
                                href={`${image?.asset?.url}?dl=`}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="flex justify-center items-center p-2 text-dark bg-white text-xl rounded-full opacity-75 hover:opacity-100"
                            >
                                <MdDownload  />
                            </a>
                        </div>
                        {alreadySaved ? (
                            <button 
                                type="button" 
                                className="bg-red-500 opacity-95 hover:opacity-100 text-white font-bold px-4 py-1 text-base rounded-3xl hover:shadow-md outline-none">
                                Saved
                            </button>
                        ) : (
                            <button 
                                onClick = { (e) => {
                                    e.stopPropagation()
                                    savePin(_id)
                                }}
                                type="button" className="bg-red-500 opacity-75 hover:opacity-100 text-white font-bold px-4 py-1 text-base rounded-3xl hover:shadow-md outline-none">
                                Save
                            </button>
                        )}
                    </div>
                    <div className="flex justify-between items-center gap-2 w-full">
                        <div className="flex justify-start items-center gap-1">
                        <Link to={`user-profile/${postedBy?._id}`} className="relative flex gap-2 items-center w-32 h-8 bg-white rounded-full opacity-75 hover:opacity-100 hover:shadow-md">
                            <img src={postedBy?.image} alt="user-profile" className="absolute left-1 w-7 h-7 rounded-full object-cover" />
                            <p className="absolute left-10 text-dark font-semibold capitalize text-xs">{postedBy?.userName}</p>
                        </Link>
                        </div>
                        {postedBy?._id === user?.googleId && (
                            <button 
                                onClick = { (e) => {
                                    e.stopPropagation()
                                    deletePin(_id)
                                }}
                                type="button" 
                                className="bg-white p-2 opacity-75 hover:opacity-100 text-dark font-bold text-base rounded-3xl hover:shadow-md outline-none">
                                <AiTwotoneDelete/>
                            </button>
                        )}
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}

export default Pin
