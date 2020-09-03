module.exports = (app, config) => {

    const messageService = app.service.message;
    const Joi = app.helpers.joi;
    const _ = app.helpers._;

    async function history(req, res) {

        try {

            const schema = Joi.object().keys({
                roomToken: Joi.string().required(),
                namespace: Joi.string().valid('customer', 'artisans').required(),
                limit: Joi.number().default(20).min(5).max(20),
                page: Joi.number().default(1).min(1)
            });

            const { error, value } = Joi.validate(req.query, schema, { abortEarly: false });

            if (!_.isNull(error)) return res.send(400, {
                code: 400,
                message: error.details[0].message,
                success: false
            });

            if (value.page > 0) value.page -= 1;
            value.page = value.limit * value.page;


            const chat = await messageService.history({ roomToken: value.roomToken, namespace: value.namespace }, value.page, value.limit);
            res.send({ message: "chat", data: chat });

        } catch (e) {

            res.send({ message: e.message, success: false });

        }
    }
    return {
        history
    }

}