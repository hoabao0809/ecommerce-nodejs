'use strict'
const keyTokenModel = require('../models/keyToken.model')

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey }) => {
        try {
            // const publicKeyString = publicKey.toString()
            const token = await keyTokenModel.create({
                user: userId,
                publicKey,
                privateKey
            })

            return token ? token.publicKey : null
        } catch (error) {
            return error            
        }
    }
}

module.exports = KeyTokenService