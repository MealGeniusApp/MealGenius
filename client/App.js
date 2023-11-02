
import {AppState } from 'react-native';
import Navigation from './Screens/Navigation';
import Login from './Components/Login';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'
import {BASE_URL} from "@env"
import { P_SPECIAL, P_FAST, P_EASY, P_MED, P_HARD } from './PrefTypes'; // Import the pref constants

let defaultBreakfast = [{"description": "Freshly baked muffins filled with ripe bananas and crunchy walnuts, perfect for a quick and delicious breakfast.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWPj_2sReqVpPp9rKClDUO9aBw73b93oFFzQgFqbpNRSRTUZ9INH75iFiMxw&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Banana Nut Muffins "}, {"description": "A classic combination of crispy bacon, fresh lettuce, and juicy tomato sandwiched between toasted whole grain bread.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNfhQ5gmQuMOqJcxSXjZvH5tZAiaS4YTVLVKTvG4ZbisFsNCoiC-seGC7DTEg&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Breakfast BLT Sandwich"}, {"description": "Fluffy, buttery biscuit stuffed with savory sausage and gooey cheese, making for a deliciously satisfying breakfast on-the-go.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSfsjQo3BGpqra5BmBVsUHAvPWvNB0Xa7-2vD6iNvmedBhG8_1pCSuLLWJRw&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Sausage and Cheese Biscuit"}, {"description": "A puffy and golden baked pancake with a crispy edge, served with powdered sugar and fresh berries.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmgyXazQTE11OqqH17-PDjivT4L4RXHBMwBVbSq94tB1UsnY88JAc8JlVcSg&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Dutch Baby Pancake"}, {"description": "A hearty bowl of cooked quinoa topped with fresh berries, slivered almonds, and drizzled with a touch of honey.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDzGZKhBjKWcv8RSfBFjxBDfP6nL4bSxJ8R_L4CbIxsqhGuQ6KhvYlekSZtpU&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Quinoa Breakfast Bowl "}, {"description": "Crunchy mix of oats, nuts, and dried fruits, topped with creamy yogurt and drizzled with honey for a wholesome morning treat.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQykvQu9dyB1FrPS-Ja18SGUXngZwGoXjsWX0AFWN9gDJ4dlluNffLx2cnXsw&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Granola Bowl "}, {"description": "A flavorful combination of turkey sausage, scrambled eggs, and melted cheese wrapped in a warm whole wheat tortilla.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXdLy2eEYAbwEFgdXb9CDJ1tWOa7DyVzqwKUITJ5bO8W-XdWj_2DneuH56Vik&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Turkey Sausage Wrap"}, {"description": "Fluffy and flavorful egg dish loaded with sautéed vegetables, gooey melted cheese, and a hint of aromatic herbs.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSivTu_Ld0vGnDkhQN6m1YoTz09DI3n4eLUz4Eq9T3faLx0AzW2XuxbggjwUWY&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Breakfast Frittata "}, {"description": "Indulge in crispy yet soft Liege waffles, studded with crunchy pearl sugar and a dusting of powdered sugar.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsIgx_Lb8483MiVR7s4hQBWvbwdiZfoDLjgzvOnu4B9GfMLgkffrwRuYzKdA&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Belgian Liege Waffles "}, {"description": "A savory combination of scrambled eggs, melted cheddar cheese, crispy bacon, and fresh vegetables, served on a toasted bagel.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3htN83dF6qbOfoEOXX1ZZq9A5gl6VoIaqsujS31Z5UQi_G1NUFV5jM9EByg&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Breakfast Bagel Sandwich"}, {"description": "A Middle Eastern dish consisting of poached eggs in a savory tomato and bell pepper sauce, flavored with spices.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLqilIrE-GWGi3J2uv4-oMyCC9eWBVGvn4YStaojmfc-Woqk8wP3lbQwpARw&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Shakshouka "}, {"description": "Fluffy and flavorful frittata loaded with fresh spinach and creamy feta cheese, perfect for a nourishing breakfast.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFZNsClga-tRV08IMqPd1j2urWl0cPbqMT-wotzBPcCJb1vdgEgLfIi7LMpjA&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Spinach and Feta Frittata "}, {"description": "A savory combination of crispy corned beef, diced potatoes, and onions, all cooked to perfection on a griddle.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqr6BMBaFpJ1iXyuZARjaJKAFvgPxvZY5jzL7SPPwoZvBrsq0QzTX4fwv-iA&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Corned Beef Hash"}, {"description": "A flavorful mix of scrambled eggs, diced chorizo, sautéed peppers and onions, topped with melted cheese and served with toasted bread.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0KUVutPdzny4v75mjAJ21ejhsAQCBco6LWKgiuQ2Ux0QHlICavSQuHKf-gA&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Chorizo Scramble "}, {"description": "Creamy oats infused with sweet strawberry flavor, topped with fresh berries and a sprinkle of crunchy granola.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN0sIznMpb_1-L7C3nPu9Ya5d6-inuyZ9pBWZDTtXhH_xzrqDUqN1C1y9u2uA&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Strawberry Overnight Oats "}, {"description": "Warm, cinnamon-spiced baked apples topped with crunchy granola for a comforting and healthy breakfast treat.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvpU8tE3DWq1yD1FRRXnnGdG9sZQP5Idr_7ggKsk4fA9N_yv9f08zl2QQkyns&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Baked Apples with Granola Topping "}, {"description": "Creamy and comforting porridge made with fragrant coconut milk, topped with toasted coconut flakes and a sprinkle of cinnamon.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3DiKMcchfhIOlRQQe-Zd3-lauZNaFBkWoRFQ7nvxbnCy5j-6mfSFwx21Qvyo&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Coconut Rice Porridge "}, {"description": "Creamy oatmeal topped with sliced bananas, crunchy almond slices, and a drizzle of honey for a wholesome start to your day.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcx_HJMCEsVIUjkcigry4QK7y5130Z7btnlocbZm3G5KW1aQdCrnKnjgTFxQ&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Oatmeal Bowl "}, {"description": "A flaky and buttery pastry filled with a mix of dried fruits and nuts, perfect with a cup of coffee.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9fA-qxHfB65CXhXqZ9Qsc0mhpk_tNDtHOzV6wI7qumr2AGHOBHkFAAQLhmEM&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Breakfast Scone "}, {"description": "Layers of creamy yogurt, crunchy granola, and fresh mixed berries, creating a delightful and nutritious morning treat.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1GqtRa-C8QVftxVwpVPfCovQnjg9s87V51Ae-XUIiEdHeqtvw1ka881ewKjs&amp;s", "ingredients": "", "instructions": "", "meal": "breakfast", "title": "Breakfast Parfait "}]
let defaultLunch = [{"description": "A classic Italian dish featuring al dente spaghetti tossed with crispy pancetta, creamy egg sauce, and grated Parmesan cheese.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs73ixFaEvuVtE0nt4fAyUVbB1cW8815xDC06o1Yy7MoYErx4orFAmwGjVIw&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Spaghetti Carbonara "}, {"description": "A colorful bowl filled with a mix of roasted veggies, quinoa, chickpeas, and a creamy tahini dressing.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8mhoEWQWmI07qNNBAQh3zJR4cU8IGV0ejMRnaYr3zUm32LrwSfoG3G0RoYJQ&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Vegetarian Buddha Bowl"}, {"description": "Succulent salmon glazed with teriyaki sauce, served over a bed of steamed rice and accompanied by sautéed vegetables.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxJ2_VCzHfOaWoj_ctXIKBO9EVdLKAOlzt0MpElHbSKBPKcHm2OuPjaZzADg&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Teriyaki Salmon Bowl"}, {"description": "A deliciously aromatic and spicy curry with a perfect balance of coconut milk, tender chicken, fresh vegetables, and fragrant herbs.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG_nwo5u2Pv5BbSIt8G5eSG442qryhH3U40ScWQ24Jc7eBvm-1tb2sF6j7y4Y&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Thai Green Curry"}, {"description": "A colorful bowl of mixed vegetables, marinated beef, and a sunny-side-up egg, served over a bed of steaming hot rice.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExC-evPEiDOZd8mRpr7dkBIv00DGXyyy5ZbH5AvJfFWEybiDySdGH2yI-LkY&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Korean Bibimbap"}, {"description": "Tender, slow-cooked pork smothered in smoky BBQ sauce, served on a soft bun with tangy coleslaw. A mouthwatering flavor explosion!", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtjO2cp6IXuM04B3nI2JCrrvRLhznS5RS8eTK4oJPTgCAtXrq5HOSuSdLo51E&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "BBQ Pulled Pork Sandwich "}, {"description": "A delectable wrap filled with succulent grilled chicken, crisp romaine lettuce, Parmesan cheese, and creamy Caesar dressing.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlFyXdkQ4RwlzzIl7kcBARqUStC-SnuPbPJQF7U4a3yRYz0IwdGSni38JXhNY&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Chicken Caesar Wrap"}, {"description": "A refreshing mix of diced raw fish, rice, and tropical fruits, seasoned with soy sauce and sesame oil.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN-n6DQEr8Y4JK394X82WL6_EXbip1P3zgf63-2RCgluMGiWtK413xOKUQvDw&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Hawaiian Poke Bowl"}, {"description": "Soft corn tortillas filled with savory grilled steak, fresh cilantro, tangy pickled onions, and a squeeze of lime. Satisfying and full of flavor.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiT849AVLwSFuXQrf21UcBJVDguE5Bk96pRfcbgrjfzP-VM3gLSNZEr_Tmzg&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Mexican Street Tacos"}, {"description": "A light and crispy flatbread topped with tangy hummus, juicy tomatoes, refreshing cucumbers, and zesty feta cheese.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB52nuywPqK-dzKg-ebjQPppyZOhL7T3JF4MvDKmKDLxMZZ5SG5CxwufMi3g&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Mediterranean Flatbread"}, {"description": "Savor the perfect balance of flavors in this fiery stir-fry featuring tofu, mixed vegetables, and a spicy soy-based sauce.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW0VqxOeAjJhhvXtIZRBZbDZGv49A44EcKc3DQvK5JjWYgk_EEihEwAbLrRww&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Spicy Tofu Stir-Fry"}, {"description": "Crispy white fish, topped with tangy slaw and spicy mayo, wrapped in warm tortillas for a zesty lunch.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThSix0Ng7RINnKjmT1KwBn1V_iCVP9Hett2j-twvCff-AroAh1DflJw0hyPQ&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Fish Tacos"}, {"description": "A juicy beef patty topped with melted cheese, crispy bacon, and tangy BBQ sauce, served on a freshly toasted bun.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzNrXCs3ExfT12rtzD90PsW0KP9mmLOwsai4cQh43b22h2q0dfZuu6zfCX_lU&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "BBQ Bacon Cheeseburger"}, {"description": "Juicy and tender marinated chicken, wrapped in warm pita bread with a refreshing combination of tomatoes, cucumbers, and tzatziki sauce.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWxwgrUOrBz4PgSgLvkHNekZC1yiEAe_gYvVliWc3-TzxjsKY2Wq-b60yJVqM&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Chicken Shawarma "}, {"description": "A spicy and tangy Thai soup made with lemongrass, lime leaves, and a variety of fresh vegetables.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSnzqYPaWdG4kNsB-uJta5jXXbzQ14keLL1byaHhfWaIbFBYdBEuilj2DnBA&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Tom Yum Soup"}, {"description": "A satisfying bowl of fluffy brown rice, topped with tender tofu in a savory teriyaki sauce, accompanied by steamed broccoli and carrots.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStyrRAuscjqq35ziVt9gZmgyvnkkcXy8CjF1bN2xJ9xzJuA248QM45-U6-Xg&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Teriyaki Tofu Bowl"}, {"description": "Tender breaded chicken cutlets smothered in marinara sauce, melted cheese, and served over a bed of spaghetti.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0UxtGJ9EA4SWEqFnLaiTFu1PV0AEk98lzL4vecBeqRgmHN0hoENWD3uxIBw&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Chicken Parmesan"}, {"description": "Vibrant assortment of sautéed vegetables tossed in a savory soy-ginger sauce, served over steamed rice. A healthy and flavorful lunch option.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9KZYrOHsymmShLamxxKmEZxeWx1SRoXlfg6wmOYQ_GYmeokIjJBmMQQR_eXE&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Vegetable Stir-Fry"}, {"description": "A classic sandwich with crispy bacon, fresh lettuce, and juicy tomatoes, all layered between toasted bread.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3fBLlf5AVZqjTo6ynmZG3C85MlKZeRoZ4e5NXaE44XgvMZUb7WnGFwKf_JA&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "BLT Sandwich"}, {"description": "A fragrant blend of fluffy couscous, tender chickpeas, sautéed vegetables, and warm Moroccan spices, bursting with vibrant and exotic flavors.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCh-5HTOGe49xCkxJbqnD_11nF6HKjguVslUgouIKatWdglVkoqPkGVCK2NA&amp;s", "ingredients": "", "instructions": "", "meal": "lunch", "title": "Moroccan Couscous"}]
let defaultDinner = [{"description": "Tender salmon fillet seasoned with aromatic herbs, perfectly grilled to achieve a mouthwatering smoky flavor and served with a refreshing citrus-infused salad.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpK57zXuK2iZ147-wFKljrvm_4SJ-RwN1AL1JVL2Mo1XxsmxKEZQijFSwL8g&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Grilled Salmon "}, {"description": "Creamy pasta dish with tender grilled chicken breast strips, tossed in a mouthwatering homemade Alfredo sauce.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcb2GQUz7IIbnRMizUTqvAnwmvZ55i7VTdPVgsjvx_S9fwr3VdBfgJH1HPLg&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Chicken Alfredo "}, {"description": "Slices of tender beef sautéed with colorful vegetables, tossed in a flavorful ginger-soy sauce, served over a bed of fluffy rice.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg6JCR-ir2kBsaA9VshGBpdd0lNFEdlpibbYikElCF1oNgL8OXubHOVAb15g&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Beef Stir-Fry"}, {"description": "Delightfully cheesy vegetarian dish with jumbo pasta shells filled with ricotta, parmesan, and spinach, baked to golden perfection.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRr6FK-GRJh8zOcrZ_cOZpWHwHosPy93y7LKErxg3cTidldgeE-56KyicKndyU&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Baked Stuffed Shells"}, {"description": "A refreshing salad with fluffy couscous, juicy tomatoes, crisp cucumbers, tangy feta cheese, and a zesty lemon herb dressing.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJgQDOP6Dcz949lvuQRTPizoxMkGcOkcMuhm6FhaPTNnoa-MqD_JyAOaaHx8E&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Mediterranean Couscous Salad"}, {"description": "A flavorful and nutritious stir-fry, filled with tofu, fresh vegetables, and a delicious homemade teriyaki sauce.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSakwBP4PiaFE_SD2FktYk4Gkh5XHxcpQ3-8b3knW3bh6tiXTOAOPReYtCgVQ&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Teriyaki Tofu Stir-Fry"}, {"description": "Succulent shrimp sautéed with garlic, butter, and white wine, served over a bed of angel hair pasta. A classic and flavorsome seafood delight.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUy__rfj_WIps1PwH0Y906oVEoiYIBbkdElUkGC5rKqWf4mPHNZwrd-4ccfAo&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Shrimp Scampi "}, {"description": "Indulge in a flavorful blend of aromatic spices with tender vegetables simmered in a lusciously rich tomato base.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEBjBiey3ARXfWG_vTkOMK-uo5AzpEIbpbACm_y_t1iF3EvHH1GgW0aryvpw&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Spicy Indian Curry"}, {"description": "Succulent lobster meat tossed in a garlic butter sauce with al dente linguine, creating a rich and indulgent seafood pasta.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShtrFlEVveIK7G8oHB_BxGCZrlzI3ncNdysN0yASk7KRUIuSxZOXJrwaElIg&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Lobster Linguine "}, {"description": "Slow-cooked pork shoulder smothered in tangy BBQ sauce, piled high on a soft bun, accompanied by crispy coleslaw.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtjO2cp6IXuM04B3nI2JCrrvRLhznS5RS8eTK4oJPTgCAtXrq5HOSuSdLo51E&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "BBQ Pulled Pork Sandwich "}, {"description": "A flavorful dish that combines stir-fried tofu, rice noodles, bean sprouts, peanuts, and tangy tamarind sauce.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxlEFKTNBYr4X9oDSygELId_HrZPG3THB-rGSaVcUtlYadynSc7rX2U0oUDmw&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Tofu Pad Thai"}, {"description": "A classic thin crust pizza topped with fresh tomatoes, mozzarella cheese, and fragrant basil leaves. Simple and delicious.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh56SULlZJSjIQWb6CNl1-0_mwRCNDpUDaVoGRO-MoqfkF_ceW327i97DvjA&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Margherita Pizza "}, {"description": "A flavorful bowl of mixed rice with sautéed vegetables, thinly sliced beef, fried egg, and spicy gochujang sauce.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExC-evPEiDOZd8mRpr7dkBIv00DGXyyy5ZbH5AvJfFWEybiDySdGH2yI-LkY&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Korean Bibimbap"}, {"description": "Tender chunks of lamb slow-cooked with aromatic spices, dried fruits, and fragrant herbs, served over fluffy couscous.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxTurcQaC5PnaRpULs8csI6xC3a0Vhgz6w-UludgDMBnJ92TZhiFHjxt4pfQ&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Moroccan Lamb Tajine "}, {"description": "A comforting blend of Arborio rice cooked in a rich broth, sautéed mushrooms, and finished with a touch of cream.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIO4NnriOW8EkrEFEj9S18Qf1LHpqLxS1j9VCYx_LjeuNQi5ZwW1aLkQTzRp8&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Creamy Mushroom Risotto "}, {"description": "A classic combination of juicy pineapple, savory ham, and melted cheese on a perfectly crispy and delicious pizza crust.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyVfwrpkuaNz6QcpXhI8mWpl8_BGmvVOihWW7gYzj4OjgfUnOTxP-Qzqs9EQE&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Hawaiian Pizza "}, {"description": "Hot and flavorful enchiladas filled with seasoned ground beef, black beans, cheese, and smothered in tangy red sauce.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOsQEqbGDngZmsv8vP0tmgzU96J0E5M__70225UGcKJMsVMBN0uYo6xJmgz1k&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Mexican Enchiladas"}, {"description": "A fragrant curry made with coconut milk, lemongrass, and Thai basil, served over steamed jasmine rice.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG_nwo5u2Pv5BbSIt8G5eSG442qryhH3U40ScWQ24Jc7eBvm-1tb2sF6j7y4Y&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Thai Green Curry"}, {"description": "Tender and juicy sirloin steak coated in a flavorful garlic butter sauce. Served with roasted potatoes and sautéed vegetables.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4v18XmE6ypRKoZypnnqO8Yhk2mYSxuf2yCyBouelCtTwPtdLLBaN1klV2XQ&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Garlic Butter Steak"}, {"description": "A fragrant and colorful dish with a perfect balance of sweet and savory flavors, loaded with pineapple, vegetables, and aromatic spices.", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfFpXOWrc-3T3mqMWcADr-WTD4tJBLzDkDkITyAhRjNnVgvSoQ7B0LJxRGfQ&amp;s", "ingredients": "", "instructions": "", "meal": "dinner", "title": "Thai Pineapple Fried Rice "}]

let breakfastQueue = []
let lunchQueue = []
let dinnerQueue = []

let breakfastToGenerate = 0
let lunchToGenerate = 0
let dinnerToGenerate = 0

// The size of the queue when printing will not exceed 10. What happens, is extra food is generated, because some generations over dominate the update of the queue for others. So a food generation will sometimes fail to update the state, causing an extra generation
export default function App() {

  const [authenticated, setAuthenticated] = useState(false)
  

  // Stateful progress monitors stateless queues and sends data to loading screen for real-time analytics.
  const [progress, setProgress] = useState(0)
  const [breakfastLoaded, setBreakfastLoaded] = useState(false)
  const [lunchLoaded, setLunchLoaded] = useState(false)
  const [dinnerLoaded, setDinnerLoaded] = useState(false)

  const [tokens, setTokens] = useState(0)
  const [userId, setUserId] = useState()
  const [meals, setMeals] = useState()

  const [nextMeal, setNextMeal] = useState('')

  const DEFAULT_MEAL = 'breakfast'
  const [activeMeal, setActiveMeal] = useState(DEFAULT_MEAL)
  const [preferences, setPreferences] = useState({})

  const [init, setInit] = useState(false)
  // Automatically check to see if we are logged in
  const [preInit, setPreInit] = useState(true)
  const [loading, setLoading] = useState(true)
  const MIN_QUEUE_SIZE = 12

  // When we authenticate, initialize.
  useEffect(() =>
  {
    if (authenticated)
    {
      setInit(true)
    }
  }, [authenticated])


  useEffect(() =>
  {
    AsyncStorage.getItem('token').then(value => {
      // If we are logged in, set auth to true to show the app and init
      if (value)
      {
        logIn(value)
      }
      setPreInit(false)
    })

  }, [preInit])

  useEffect(() => {
    // If all meals are loaded, set loaded to true because everything has loaded
    if (breakfastLoaded && lunchLoaded && dinnerLoaded)
    {
      if (loading)
      {
        setLoading(false)
        
      }
    }

  }, [breakfastLoaded, lunchLoaded, dinnerLoaded])

  // When setting new meal type, show the meal on the UI
  useEffect(() =>
  {
    if (!loading)
    {
      switch (activeMeal)
      {
        case 'breakfast':
        {

          setNextMeal(breakfastQueue[0])
          break
        }
        case 'lunch':
        {
          setNextMeal(lunchQueue[0])
          break
        }
        case 'dinner':
        {
          setNextMeal(dinnerQueue[0])
          break
        }
      }
    }
  },[activeMeal])


  // Loading has started or finished. If it finished, we can set next meal
  useEffect(() =>
  {
    if (loading)
    {
      // loading...
    
    }
    else{
      // Done loading.. trigger meal update
      console.log('Done loading!')
      //setActiveMeal(DEFAULT_MEAL)
      if (!nextMeal)
      {
        switch (activeMeal)
        {
          case 'breakfast':
          {
            setNextMeal(breakfastQueue[0])
            break
          }
          case 'lunch':
          {
            setNextMeal(lunchQueue[0])
            break
          }
          case 'dinner':
          {
            setNextMeal(dinnerQueue[0])
            break
          }
        }
      }
      
    }
  }, [loading])

  useEffect(() =>
  {
    
    // Makes sure we re-render to show the first meal: Experimental
  }, [nextMeal])


  const handleAppStateChange = newState => {
    if (newState === 'inactive') {

      // Save the state... no need, saved in DB when swiped.

      // AsyncStorage.setItem('breakfast_list', JSON.stringify(breakfastList))
      // AsyncStorage.setItem('lunch_list', JSON.stringify(lunchList))
      // AsyncStorage.setItem('dinner_list', JSON.stringify(dinnerList))
      
    }

  };



  useEffect(() => {
    // Subscribe to AppState changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up subscription when component unmounts
    return () => {
      appStateSubscription.remove();
    };
  }, []);

  // Force regeneration of all meals
  function refreshMeals()
  {
    setLoading(true)
    AsyncStorage.removeItem('breakfast_queue')
    breakfastQueue = []
    setBreakfastLoaded(false)
    scheduleMeal('breakfast', (MIN_QUEUE_SIZE ))

    AsyncStorage.removeItem('lunch_queue')
    lunchQueue = []
    setLunchLoaded(false)
    scheduleMeal('lunch', (MIN_QUEUE_SIZE ))

    AsyncStorage.removeItem('dinner_queue')
    dinnerQueue = []
    setDinnerLoaded(false)
    scheduleMeal('dinner', (MIN_QUEUE_SIZE ))

  }


  // user logged in, load queues
  useEffect(() => {

    if (authenticated)
    {

      // Load queues up given history.
    AsyncStorage.getItem('breakfast_queue').then(value => {
      let q = JSON.parse(value)
      if (q)
      {
        if (q?.length >= MIN_QUEUE_SIZE - 1)
      {
        
        // We have saved data, load it!
        breakfastQueue = q
        
        setBreakfastLoaded(true)
        
      }

      // No saved data present - must generate new!
      else
      {
        if (q)
          breakfastQueue = q
        scheduleMeal('breakfast', (MIN_QUEUE_SIZE - (q? q.length: 0)))
      }
      
      setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
        
      }

      else // load default breakfast
      {
        breakfastQueue = defaultBreakfast
        AsyncStorage.setItem('breakfast_queue', JSON.stringify(breakfastQueue))
        setBreakfastLoaded(true)
        setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
      }
      
    });

    AsyncStorage.getItem('lunch_queue').then(value => {
      let q = JSON.parse(value)
      if (q)
      {
        if (q?.length >= MIN_QUEUE_SIZE - 1)
        // We have saved data, load it!
        {
          lunchQueue = q
          setLunchLoaded(true)
        }
        
    

      // No saved data present - must generate new!
      else
      {
        if (q)
          lunchQueue = q
        scheduleMeal('lunch', (MIN_QUEUE_SIZE - (q? q.length: 0)))
      }
        
      setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
        
      }
      else // load default breakfast
      {
        lunchQueue = defaultLunch
        AsyncStorage.setItem('lunch_queue', JSON.stringify(lunchQueue))
        setLunchLoaded(true)
        setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
      }
      
    });

    

    AsyncStorage.getItem('dinner_queue').then(value => {
      let q = JSON.parse(value)
      if (q)
      {
        if (q?.length >= MIN_QUEUE_SIZE - 1)
        // We have saved data, load it!
        {
          dinnerQueue = q
          setDinnerLoaded(true)
        }
        


      // No saved data present - must generate new!
      else
      {
        if (q)
          dinnerQueue = q
        scheduleMeal('dinner', (MIN_QUEUE_SIZE - (q? q.length: 0)))
      }

      // Update load progress
      setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
        
      }
      else // load default breakfast
      {
        dinnerQueue = defaultDinner
        AsyncStorage.setItem('dinner_queue', JSON.stringify(dinnerQueue))
        setDinnerLoaded(true)
        setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
      }
      
    });
    }
    
  

  }, [authenticated])


  // Log out through preference page
  function logOut()
  {
    AsyncStorage.removeItem('token')
    setAuthenticated(false)
  }

  // Clear history
  function clearHistory()
  {
    // Call api to set history
    return axios.post(`${BASE_URL}/clearHistory`, {user_id: userId})
  }

  // Meal queues
  function scheduleMeal(meal, count)
  {
    // Increase the number of meals to generate
    switch(meal)
    {
      case 'breakfast':
      {
        breakfastToGenerate += count
        break
      }
      case 'lunch':
      {
        lunchToGenerate += count
        break
      }
      case 'dinner':
      {
        dinnerToGenerate += count
        break
      }
    }

    // Start the cycle if it was not running
    if ( ((meal === 'breakfast'? breakfastToGenerate : meal === 'lunch'? lunchToGenerate : dinnerToGenerate) === count) || getPref(P_FAST, false))
    {
      // Queue was empty so must start the recursive calls
      generateMeal(meal)
    }
  }

  // Get the preference or return default
  function getPref(pref, fallback)
  {
    let res = preferences[pref]
    if (typeof res === 'undefined')
      return fallback
    return res
  }

  // On first load, get values from storage and restore state
  if (init)
  {
    setInit(false)

    console.log('initializing')

    // Load user data from DB
    AsyncStorage.getItem('token').then(value => {
      if (value)
      {
        logIn(value)
      }
    })
    

    // Initialize preferences
    // Prefs are to be saved after modifying one: set state variable and store
    AsyncStorage.getItem('preferences').then(value => {
      if(value)
        setPreferences(JSON.parse(value))
    })


  }

// Saves the new preferences dictionary
function savePreferences(prefs)
{
  setPreferences(prefs)
  AsyncStorage.setItem('preferences', JSON.stringify(prefs))
}

// middleware Login from login screen: Must set token because it definitely is not set
function loggedIn(token)
{
  AsyncStorage.setItem('token', token)
  logIn(token)
}

// Log in: load user data and authenticate
function logIn(token)
{
  
  axios.post(`${BASE_URL}/user`, {user_id: token})
  .then((res) => {
    setTokens(res.data.tokens)
    setMeals(res.data.meals)
    setUserId(token)
    setAuthenticated(true)
  })
  .catch((e) => {
    console.log('Error in logIn app.js: ', e)
    
  })
}

// Client changes meal from header touch
function changeMeal(newMeal)
{
  setActiveMeal(newMeal)
  //Triggers useEffect which will set the meal card
}



// Swiped on a meal
function swiped(right)
{
  // Locally decrease tokens. This is cosmetic, only.
  setTokens(tokens - 1)

  // If we ran out of meals (swiping too fast! ) Show the load screen while they regenerate
  if (((activeMeal == 'breakfast')? breakfastQueue.length : (activeMeal == 'lunch')? lunchQueue.length : dinnerQueue.length) == 1)
  {
    setLoading(true)
  }
  // Remove and store the first item from the array
  let meal = ''
  switch (activeMeal)
  {
    case 'breakfast':
      {
        // Queue is no longer fully loaded
        setBreakfastLoaded(false)
        meal = breakfastQueue.shift()
        setNextMeal(breakfastQueue[0])
        break
      }
    case 'lunch':
      {
        // Queue is no longer fully loaded
        setLunchLoaded(false)
        meal = lunchQueue.shift()
        setNextMeal(lunchQueue[0])
        break
      }
    case 'dinner':
      {
        // Queue is no longer fully loaded
        setDinnerLoaded(false)
        meal = dinnerQueue.shift()
        setNextMeal(dinnerQueue[0])
        break
      }

    default:
      {
        meal = null
        break
      }
  }

  // Schedule the new meal to be generated: Starts meal gen or increases count
  scheduleMeal(activeMeal, 1)

  // We know the meal , we need to learn it
  if (right)
    learnMeal(meal)

  
}

// Learn a meal - when swiped right, gather instructions and ingredients, and when done, add to cookbook
function learnMeal(meal)
{

}

async function generateMeal(meal)
{
  console.log('Generating a meal...')
  // Gather preferences from state
  let requests = getPref(P_SPECIAL, 'None')
  let complexity_easy = getPref(P_EASY, true)? 1: 0
  let complexity_hard = getPref(P_MED, true)? 1: 0
  let complexity_medium = getPref(P_HARD, true)? 1: 0

  let complexity = ''

  if (complexity_easy + complexity_medium + complexity_hard === 2 || complexity_easy + complexity_medium + complexity_hard === 1)
  {

    if (complexity_easy)
    {
      complexity += 'easy'
    }

    if (complexity_medium)
    {
      complexity += (complexity)? ' or medium': 'medium'
    }

    if (complexity_hard)
    {
      complexity += (complexity)? ' or complex': 'complex'
    }
    
  }

  

  // Execute endpoint from server
  axios.post(`${BASE_URL}/generateMeal`, {meal: meal, complexity: complexity, requests: requests, user_id: userId})
  .then(response => {
    let description = response.data.description
    let title = response.data.title
    let image = response.data.image


    newMeal = {title: title, description: description, meal: meal, image: image, ingredients: '', instructions: ''}
          // Debug print for the generated food title
          console.log(title)

          if (meal === 'breakfast')
          {
            breakfastQueue.push(newMeal)
            breakfastToGenerate--
            AsyncStorage.setItem('breakfast_queue', JSON.stringify(breakfastQueue))

            // Load next meal if queue is not empty
            if (breakfastToGenerate > 0)
            {
              generateMeal('breakfast')
            }
            else
            {
              setBreakfastLoaded(true)
            }
          }

          else if (meal === 'lunch')
          {
            lunchQueue.push(newMeal)
            lunchToGenerate--
            AsyncStorage.setItem('lunch_queue', JSON.stringify(lunchQueue))

            // Load next meal if queue is not empty
            if (lunchToGenerate > 0)
            {
              generateMeal('lunch')
            }
            // If lunch just has not yet loaded, it has been loaded now
            else
            {
              // Will check if all food types are loaded and if so sets loading to false through useEffect
              setLunchLoaded(true)
            }
          }
          else if (meal === 'dinner')
          {

            dinnerQueue.push(newMeal)
            dinnerToGenerate--
            AsyncStorage.setItem('dinner_queue', JSON.stringify(dinnerQueue))

            // Load next meal if queue is not empty
            if (dinnerToGenerate > 0)
            {
              generateMeal('dinner')
            }

            // If dinner just has not yet loaded, check if it is now loaded
            else
            {
              // Will check if all food types are loaded and if so sets loading to false through useEffect
              setDinnerLoaded(true)
            }
          }
        
          // Update loading progress
          setProgress((breakfastQueue.length + lunchQueue.length + dinnerQueue.length) / (3 * MIN_QUEUE_SIZE))
      

  })
  .catch(error => {
    console.log(`Error in MealGenius api @ generateMeal: `, error)
  })

}
  if (authenticated)
  {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Navigation refreshMeals = {refreshMeals} prefs = {preferences} savePreferences = {savePreferences} clearHistory = {clearHistory} logout = {logOut} loadProgress = {progress} changeMeal = {changeMeal} mealTitle = {activeMeal} swipe = {swiped} nextMeal = {nextMeal} loading = {loading} tokens = {tokens}></Navigation>
        </GestureHandlerRootView>
    );
  }
  return(
    <Login login = {loggedIn}></Login>
  )

  
}
