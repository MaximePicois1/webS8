-- --------------------------------------------------------

--
-- Table structure for table `vetement`
--

CREATE TABLE `vetement` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `isSpecialOffer` tinyint(1) DEFAULT NULL,
  `taille` varchar(255) DEFAULT NULL,
  `confort` int(11) DEFAULT NULL,
  `price` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `vetement`
--

INSERT INTO `vetement` (`id`, `name`, `cover`, `category`, `isSpecialOffer`, `taille`, `confort`, `price`) VALUES
(1, 'pull', 'http://localhost:8000/images/2.jpg', 'haut', NULL, 'L', 1, 15),
(2, 'robe', 'http://localhost:8000/images/8.jpg', 'bas', 1, 'XS', 2, 26),
(3, 'pantalon', 'http://localhost:8000/images/3.jpg', 'bas', NULL, 'M', 3, 12);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `vetement`
--
ALTER TABLE `vetement`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `vetement`
--
ALTER TABLE `vetement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;


