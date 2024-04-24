import { SiweMessage } from 'siwe'
import { createSIWEConfig } from '@web3modal/siwe'
import type { SIWECreateMessageArgs, SIWESession, SIWEVerifyMessageArgs } from '@web3modal/siwe'

function generateNonce(length: number): string {
    const array = new Uint8Array(length / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function getNonce(adress?: string): Promise<string> {
    return generateNonce(32)
}

/* Function that creates a SIWE message */
function createMessage({ nonce, address, chainId }: SIWECreateMessageArgs){
  const message = new SiweMessage({
    version: '1',
    domain: window.location.host,
    uri: window.location.origin,
    address,
    chainId,
    nonce,
    statement: 'Sign in With Ethereum.'
  })

  return message.prepareMessage()
}

/* Function that returns the user's session */
async function getSession(): Promise<SIWESession>{
  


  return { address: "some address", chainId: 1 }
}

/* Use your SIWE server to verify if the message and the signature are valid */
async function verifyMessage({ message, signature }: SIWEVerifyMessageArgs){
  try {
    const isValid = true

    return isValid
  } catch (error) {
    return false
  }
}

async function signOut(): Promise<boolean> {
    return true
}

/* Create a SIWE configuration object */
export const siweConfig = createSIWEConfig({
  createMessage,
  getNonce,
  getSession,
  verifyMessage,
  signOut
})