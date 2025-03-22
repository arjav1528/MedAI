

const logout = async (req,res) => {
    if(req.user){
        const user = User.findById(req.user._id);
        if(user){
            user.refreshToken = null;
            await user.save();
            
        }
    }
    return res.status(200).json(new APISuccess(200, "Logged Out Successfully"));
}


module.exports = logout;