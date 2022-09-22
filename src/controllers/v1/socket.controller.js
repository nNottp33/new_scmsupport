let rooms = [];

const AddUserToRoom = ({ id, name, room }) => {
    let post = { id, name, room };
    rooms.push(post)
    return { post }
};

const RemoveFromRoom = (id) => {
    const index = rooms.findIndex((user) => user.id === id);
    return rooms[index];
};

module.exports = {
    AddUserToRoom,
    RemoveFromRoom
}