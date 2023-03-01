import nodeGeocoder from "node-geocoder"
import dotenv from "dotenv"

dotenv.config()

const options={
    provider:'mapquest',
    httpAdapter:'https',
    apiKey:'kFpD7uI07RJxvBx7nk7eAuZVHgtRALnI',
    formatter:null
}

const geoCoder=nodeGeocoder(options)

export default geoCoder