'use strict'

class AccessController {
    signUp = async (req, res, next) => {
        try {
            console.log(`[P]:::signUp::`, req.body)
            return res.status(201).json({
                code: '20001',
                metaData: {userId: 1}
            })
        } catch {
            
        }
    }
}

module.exports = new AccessController()