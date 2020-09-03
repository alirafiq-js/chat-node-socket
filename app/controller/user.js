module.exports = (app, config) => {

    const userService = app.service.user;

    async function register(req, res) {

        try {

            console.log(req.body)
            const user = await userService.register(req.body);
            res.send({ message: "create", data: user });

        } catch (e) {

            console.log(e)
            res.send({ message: e.message, success: false });

        }
    }
    async function login(req, res) {

        try {

            console.log(req.body)
            const user = await userService.login(req.body);
            res.send({ message: "login", data: user });

        } catch (e) {

            console.log(e)
            res.send({ message: e.message, success: false });

        }
    }
    return {
        register,
        login
    }

}