import React, { useState, useEffect } from 'react'
import { render, createPortal } from 'react-dom'
import Amplify, { Auth } from 'aws-amplify'
import awsconfig from '../aws-exports.js'

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

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const user = await Auth.signIn(email, password)
      onLogin(user)
    } catch (error) {
      setError(error.message)
    }
  }

  useEffect(() => {
    setError(undefined)
  }, [email, password])

  return (
    <>
      {error && <Alert error={error} />}

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

          <div className="mt-2">
            <button className="px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 w-full">
              SSO
            </button>
          </div>
        </div>
      </form>
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
