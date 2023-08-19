'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { createTokenPair } = require("../auth/authUtils")
const KeyTokenService = require('./keyToken.service')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',

}

class AccessService {
    static signUp = async ({name, email, password}) => {
        try {
            // step 1: check email exists
            
            const holderShop = await shopModel.findOne({email}).lean()
            if (holderShop) {
                return {
                    code: 'xxxx',
                    message: 'Shop already registered'
                }
            }

            const passwordHash = await bcrypt.hash(password, 10) 

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // created privateKey, publicKey 
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLen: 4096
                })

                console.log({privateKey, publicKey});

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                })

                if (!publicKeyString) {
                    return {
                        code: 'xxxx',
                        message: 'publicKeyString error'
                    }
                }

                //created token pair
                const tokens = await createTokenPair({
                    userId: newShop._id, email
                }, publicKeyString, privateKey)

                return {
                    code: 201,
                    metaData: {
                        shop: newShop,
                        tokens
                    }
                }
            }
        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService