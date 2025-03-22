const APIError = require("../APIResponses/APIError");
const APISuccess = require("../APIResponses/APISuccess");




const HealthCheck = async (req, res) => {
    try{

        return res.status(200).json(
            APISuccess(200, {
                message: "Health Check is OK"
            })
        )

    }catch(err){
        return res.status(500).json(new APIError(500, "Internal Server Error", [], err.stack));
        process.exit(1);
    }
}

module.exports = HealthCheck;