import React, { useState, useEffect } from 'react'
import { render, createPortal } from 'react-dom'
import Amplify, { Auth } from 'aws-amplify'
import awsconfig from '../aws-exports.js'
import axios from 'axios'
import qs from 'qs'

const CLIENT_ID = '4vu67tk8tavg7iabebimtk1fm6'
const ENDPOINT_URL = 'https://ghmcdemoapp.auth.us-west-2.amazoncognito.com'
const IDENTITY_PROVIDER = 'AzureAD'
const REDIRECT_URI = 'https://staging.drss2sc7l00jb.amplifyapp.com/'

Amplify.configure(awsconfig)

const Alert: React.FC<{ error: string }> = ({ error }) => {
  return createPortal(
    <div className="mt-2 mb-3 py-2 px-2 bg-red-100 text-red-900 text-sm rounded-sm border border-red-200" role="alert">
      <strong>Error: </strong> {error}
    </div>,
    document.querySelector('#alert'),
  )
}

const SignInForm: React.FC<{ onLogin: Function }> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState()
  const [data, setData] = useState()
  const code = window.location.search.split('=')?.[1]

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const user = await Auth.signIn(email, password)
      onLogin(user)
    } catch (error) {
      setError(error.message)
    }
  }

  const verifyCode = async () => {
    try {
      const resp = await axios.post(
        `${ENDPOINT_URL}/oauth2/token`,
        qs.stringify({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
          code,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      setData(resp.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleAzureSignIn = async () => {
    window.location.assign(
      `${ENDPOINT_URL}/oauth2/authorize?identity_provider=${IDENTITY_PROVIDER}&redirect_uri=${REDIRECT_URI}&response_type=code&client_id=${CLIENT_ID}&scope=aws.cognito.signin.user.admin+email+openid+phone+profile`,
    )
  }

  useEffect(() => {
    setError(undefined)
  }, [email, password])

  if (code) verifyCode()

  return (
    <>
      {error && <Alert error={error} />}
      {data && <div>{data}</div>}

      <h1 className="text-2xl border-b border-gray-200 pb-2">Welcome</h1>

      <form onSubmit={handleSignIn} className="mt-5">
        <div>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 p-2 rounded-sm block text-sm"
            onChange={({ target }) => setEmail(target.value)}
            value={email}
            placeholder="Email Address"
            autoFocus
          />
        </div>

        <div className="mt-3">
          <input
            id="password"
            type="password"
            className="w-full border border-gray-300 p-2 rounded-sm block text-sm"
            onChange={({ target }) => setPassword(target.value)}
            value={password}
            placeholder="Password"
          />
        </div>

        <div className="mt-5">
          <div>
            <input
              type="submit"
              value="Log In"
              className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-gray-100 bg-blue-700 hover:bg-blue-600 w-full cursor-pointer"
            />
          </div>
        </div>
      </form>

      <div className="mt-2">
        <button
          onClick={handleAzureSignIn}
          className="px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 w-full"
        >
          SSO
        </button>
      </div>
    </>
  )
}

const UserInfo: React.FC<{ onSignOut: Function }> = ({ onSignOut }) => {
  const handleSignOut = async () => {
    await Auth.signOut()
    onSignOut()
  }

  return (
    <>
      <h1 className="text-2x">Logged in</h1>

      <div className="mt-5">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-gray-100 bg-red-700 hover:bg-red-600 w-full"
        >
          Sign Out
        </button>
      </div>
    </>
  )
}

const Welcome: React.FC = () => {
  const [user, setUser] = useState()

  return (
    <div className="h-full w-full flex items-center">
      <div className="mx-auto">
        <div id="alert" />
        <div className="border border-grey-200 p-8 pt-6 shadow-md bg-white" style={{ width: 500 }}>
          {user ? <UserInfo onSignOut={() => setUser(undefined)} /> : <SignInForm onLogin={setUser} />}
        </div>
      </div>
    </div>
  )
}

render(<Welcome />, document.querySelector('#app'))
