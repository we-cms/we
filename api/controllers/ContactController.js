/**
 * ContactController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  _config: {
    rest: false
  },

  getAllAuthenticatedUserContacts: function(req, res) {
    if(!req.isAuthenticated()) return res.forbidden();

    var userId = req.user.id;

    Contact.find()
    .where({
      or: [
        {
          from: userId
        },
        {
          to: userId
        }
      ],
      status: 'accepted'
    })
    .exec(function(err, contacts){
      if (err) return res.negotiate(err);

      // if has online users check how are online in current user contact list
      if ( sails.onlineusers ) {
        for (var i = contacts.length - 1; i >= 0; i--) {

          if ( contacts[i].from == userId ) {
            if( sails.onlineusers[contacts[i].to] ) {
              contacts[i].onlineStatus = 'online';
            }
          } else {
            if( sails.onlineusers[contacts[i].from] ) {
              contacts[i].onlineStatus = 'online';
            }
          }
        }
      }

      return res.send({contact: contacts});
    });
  },

  findOneUserContact: function(req, res) {
    if(!req.isAuthenticated()) return res.forbidden();

    var uid = req.user.id;
    var contactId = req.param('contactId');

    Contact.getUsersRelationship(uid, contactId, function(err, contact){
      if (err) return res.negotiate(err);

      if(!contact){
        return res.send();
      }

      return res.send({contact: contact});
    });
  },

  /**
   * Request contact relationship
   */
  requestContact: function requestContact (req, res) {
    if(!req.user.id) return res.forbiden();

    var uid = req.user.id;
    var contact_id = req.param('contactId');

    Contact.create({
      from: uid,
      to: contact_id
    })
    .exec(function(err, contact){
      if(err) return res.negotiate(err);
      // notify
      NotificationService.notify('contact_requested',req.user, contact);
      // send result
      res.send(201,{contact: contact});
    });
  },

  acceptContact: function acceptContact (req, res) {
    if(!req.user.id) return res.forbiden();

    var uid = req.user.id;
    var contact_id = req.param('contactId');

    // first get and check if has one relationship
    Contact.getUsersRelationship(uid, contact_id, function(err, contact){
      if (err) return res.negotiate(err);

      if(!contact) return res.notFound();
      // only logged in user can accept one contact
      if(contact.to != uid ) return res.forbiden();

      // set new status
      contact.status = 'accepted';
      contact.save(function(err){
        if (err) return res.negotiate(err);
        // notify
        NotificationService.notify('contact_accepted',req.user, contact);
        // send the response
        return res.send({contact: contact});
      });
    });
  },

  ignoreContact: function ignoreContact (req, res) {
    if(!req.user.id) return res.forbiden();

    var uid = req.user.id;
    var contact_id = req.param('contactId');

    // first get and check if has one relationship
    Contact.getUsersRelationship(uid, contact_id, function(err, contact){
      if (err) return res.negotiate(err);

      if(!contact) return res.notFound();
      // only logged in user can accept one contact
      if(contact.to != uid ) return res.forbiden();
      // set new status
      contact.status = 'ignored';
      contact.save(function(err){
        if (err) return res.negotiate(err);
        // notify
        NotificationService.notify('contact_ignored',req.user, contact);
        // send the response
        return res.send({contact: contact});
      });
    });
  },

  deleteContact: function deleteContact (req, res) {
    if(!req.user.id) return res.forbiden();

    var uid = req.user.id;
    var contact_id = req.param('contactId');

    // first get and check if has one relationship
    Contact.getUsersRelationship(uid, contact_id, function(err, contact){
      if (err) return res.negotiate(err);
      if(!contact) return res.notFound();
      // if user is ignored return not found
      if(contact.status === 'ignored' && contact.from === uid)
        return res.notFound();
      // delete the contact relationship
      Contact.destroy({id: contact.id})
      .exec(function(err){
        if (err) return res.negotiate(err);
        // notify
        NotificationService.notify('contact_deleted',req.user, contact);
        // send 200 response
        return res.send();
      });
    });
  }
};
