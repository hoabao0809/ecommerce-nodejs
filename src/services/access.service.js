'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const { createTokenPair } = require("../auth/authUtils")
const KeyTokenService = require('./keyToken.service')
const { getInfoData } = require("../utils")
const { BadRequestError, ConflictRequestError } = require("../core/error.response")

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
                throw new BadRequestError('Error: Shop already registered!')
            }

            const passwordHash = await bcrypt.hash(password, 10) 

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // created privateKey, publicKey 
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })

                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                console.log({privateKey, publicKey});

                const keyStore =  await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'keyStore error'
                    }
                }

                // const publicKeyObject = crypto.createPublicKey( publicKeyString )
                // console.log(`publicKeyObject::`, publicKeyObject);

                // created token pair
                const tokens = await createTokenPair({userId: newShop._id, email},  publicKey, privateKey)
                console.log(`Created Token success::`, tokens)

                return {
                    code: 201,
                    metaData: {
                        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }

            return {
                code: 200,
                metaData: null
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