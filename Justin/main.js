Router.route('/register');
Router.route('/login');
Router.route('/account');
Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/users/:_id', {
    template: 'usersPage',
    data: function(){
        return Meteor.user().profile;
    },
    onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    }
});
Router.configure({
    layoutTemplate: 'main',
    loadingTemplate: 'loading'
});

if (Meteor.isClient) {

    $.validator.setDefaults({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            email: {
                required: "You must enter an email address.",
                email: "You've entered an invalid email address."
            },
            password: {
                required: "You must enter a password.",
                minlength: "Your password must be at least 6 characters."
            }
        }
    });

    Template.login.onRendered(function(){
        var validator = $('.login').validate({
            submitHandler: function(event){
                var email = $('[name=email]').val();
                var password = $('[name=password]').val();
                Meteor.loginWithPassword(email, password, function(error){
                    if(error){
                        if(error.reason == "User not found"){
                            validator.showErrors({
                                email: "That email doesn't belong to a registered user."
                            });
                        }
                        if(error.reason == "Incorrect password"){
                            validator.showErrors({
                                password: "You entered an incorrect password."
                            });
                        }
                    } else {
                        var currentRoute = Router.current().route.getName();
                        if(currentRoute == "login"){
                            Router.go("/users/"+Meteor.userId());
                        }
                    }
                });
            }
        });
    });

    Template.register.onRendered(function(){
        var validator = $('.register').validate({
            submitHandler: function(event){
                var email = $('[name=email]').val();
                var password = $('[name=password]').val();
                var name = $('[name=name]').val();

                Accounts.createUser({
                    email: email,
                    password: password,
                    profile: {
                        name: name
                    }
                }, function(error){
                    if(error){
                        if(error.reason == "Email already exists."){
                            validator.showErrors({
                                email: "That email already belongs to a registered user."
                            });
                        }
                    } else {
                        Router.go("/users/"+Meteor.userId()); // Redirect user if registration succeeds
                    }
                });
            }
        });
    });

    Template.register.events({
        'submit form': function (event) {
            event.preventDefault();
        }
    });

    Template.login.events({
        'submit form': function(event){
            event.preventDefault();
        }
    });

    Template.navigation.events({
        'click .logout': function(event){
            event.preventDefault();
            Meteor.logout();
            Router.go('home');
        }
    });

    Template.navigation.onRendered(function(){
        this.autorun(function(){
            var currentUser = Meteor.userId();
            if(currentUser) {
                $('#myFaresLink').attr("href", "/users/" + currentUser);
            }
            if(Router.current().route.getName()=='home'){
                $('#myFares').show();

            }
            else{
                $('#myFares').hide();
            }
        });
    });

}

if (Meteor.isServer) {

}
