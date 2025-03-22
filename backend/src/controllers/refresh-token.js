

const refreshTokens = async (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken){
        return res.status(401).json(new APIError(401, "Unauthorized"));
    }

    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if(!user || (user.refreshToken !== refreshToken)){
            return res.status(403).json(new APIError(403, "Forbidden"));
        }

        const newAccessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
        return res.status(200).json(new APISuccess(200, {
            accessToken: newAccessToken
        }));
    }catch(err){
        return res.status(403).json(new APIError(403, "Invalid Token"));
    }
}


module.exports = refreshTokens;