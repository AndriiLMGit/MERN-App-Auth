import React, {useCallback, useState, useContext, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useHttp } from '../hooks/http.hook';
import { Loader } from './layout/Loader';
import { LinkCard }  from './layout/LinkCard';

export const Detail = () => {
    const {token} = useContext(AuthContext)
    const {request, loading} = useHttp()
    const [link, setLink] = useState(null)
    const linkId = useParams().id
  
    const getLink = useCallback(async () => {
      try {
        const fetched = await request(`/api/link/${linkId}`, 'GET', null, {
          Authorization : `Bearer ${token}`
        })
        setLink(fetched)
      } catch (e) {}
    }, [token, linkId, request])
  
    useEffect(() => {
      getLink()
    }, [getLink])
  
    if (loading) {
      return <Loader />
    }
  
    return (
      <>
        { !loading && link && <LinkCard link={link} /> }
      </>
    )
  }