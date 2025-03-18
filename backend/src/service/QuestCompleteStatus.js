const cron = require("node-cron");
const Quest = require("../db/models/Quest"); 


cron.schedule("1 1 * * *", async () => {
    try {
        const currentDate = new Date();

        const expiredQuests = await Quest.find({
            is_Active: { $ne: "completed" },
            end_date: { $ne: null },
            end_date: { $lte: currentDate }
        });

        const questId = expiredQuests.map(q => q._id);

    

        if (expiredQuests.length > 0) {
            await Quest.updateMany(
                { _id: { $in: expiredQuests.map(q => q._id) } },
                { $set: { is_Active: "completed" } }
            );

            await UserQuest.updateMany(
                { fk_quest_id : { $in: questId } },
                { $set: { status: "completed" } }
            );

            console.log(`Updated ${expiredQuests.length} quests to 'completed'.`);
        }
    } catch (error) {
        console.error("Error updating quests:", error);
    }
});
