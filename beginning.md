First do  npx create-next-app@latest ./ --typescript --tailwind --eslint
Then go to shadcn installation doc, select nextjs and it will give the remaining steps.
All the components will be stored in the components folder(automatically created by shadcn). eg You can install a button using the command
npx shadcn@latest add button

Download assets folder from a zip file. Put the contents of the file here
Put global.css in app

Explore tailwind.config.css and see how the author has put his favourite colors there. public folder has all the icons that we need, types has all the necessary types

The constants folder has all the routes. global.css also has the necessary utility classes

Make changes in layout.tsx, create a (root) folder with layout.tsx and page.tsx in it

You will create diff components like header box and total balance box and also work on page.tsx in root. You will also need to install query-string to use formatAmount and also install chart.js followed by npm install react-chartjs-2

For forms we shall install forms from shad cn (check shadcn react hook form)

For accepting data in form, we need server actions, so in lib folder, create a folder called actions and create a new file called user.actions.ts

Now we will create a project in appwrite and copy that id to an env variable. .env.example is also created so that other people know the env variables that we have created. Create api key in appwrite and select all scopes before that. Then copy the api key.
Go to database section in appwrite and create new database(here i called it bank). Copy the database id and store in the env variable. Create a collection(here i have named it users) and copy that id. Create another collection and name it transactions and also another collection called banks. Go to users collection and create  attributes.

Then create appwrite.ts file in lib folder as mentioned in docs( refer ssr rendering in appwrite using nextjs docs)

Go to plaid, setup an account and copy the keys. Do npm install plaid and npm install react-plaid-link . Create plaid.ts in lib folder

For dwolla, first install dwolla-v2, then we have to pass sender funding source url, receiver funding source url and the amount. Dwolla is basically for transactions.

Add attributes to bank collection in appwrite. 

Now we have to completely modify our signup as it just cant be a mere session, it should also add to database.Plus signup should now be atomic ie either everything works or nothing

We will also have to create a dwolla sandbox account, copy key and secret from applications section. When you signup a pop box comes asking all the details. In plaid in developers section and in that in the sandbox section username and password is given for sandbox which we have to enter when requested and also make sure that dwolla is enabled by going into integrations section in plaid. Click checking and saving box when asked by plaid